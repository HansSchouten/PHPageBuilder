(function() {
    let initialized = false;
    let activeBlock = null;
    let activeEditorConfig = null;
    let decoratedComponent = null;
    let appliedSource = null;
    let isBusy = false;
    let toolbarSnapshots = new WeakMap();
    const aiToolbarClass = 'phpb-ai-content-toolbar-item';

    /**
     * Return the editor configuration for the nearest configured block.
     * Selecting a heading, image or paragraph inside an AI block should still
     * open the editor for the owning block.
     *
     * @param component
     * @returns {{component: *, config: *}|null}
     */
    function getManagedBlock(component) {
        while (component) {
            let blockSlug = component.attributes['block-slug'];
            let editorConfig = blockSlug && window.blockEditors
                ? window.blockEditors[blockSlug]
                : null;

            if (editorConfig && editorConfig.type === 'ai-content') {
                return {component: component, config: editorConfig};
            }
            component = component.parent();
        }

        return null;
    }

    /**
     * Find a nested block by its relative block id.
     *
     * @param component
     * @param blockId
     * @returns {*|null}
     */
    function findNestedBlock(component, blockId) {
        let result = null;
        component.components().each(function(child) {
            if (result) {
                return false;
            }
            if (child.attributes['block-id'] === blockId) {
                result = child;
                return false;
            }
            result = findNestedBlock(child, blockId);
            if (result) {
                return false;
            }
        });
        return result;
    }

    /**
     * Serialization assigns a fresh id to temporary blocks (ids starting
     * with "ID"). Resolve the serialized id from the parent shortcode so
     * generated values are written to the key the renderer will read.
     *
     * @param data
     * @param component
     * @param fallbackId
     * @returns {*}
     */
    function resolveSerializedBlockId(data, component, fallbackId) {
        if (data.blocks && data.blocks[fallbackId]) {
            return fallbackId;
        }

        let blockSlug = component.attributes['block-slug'];
        let references = toString(data.html).match(/\[block\s+slug="([^"]+)"\s+id="([^"]+)"\]/g) || [];
        for (let reference of references) {
            let match = reference.match(/\[block\s+slug="([^"]+)"\s+id="([^"]+)"\]/);
            if (match && match[1] === blockSlug && data.blocks && data.blocks[match[2]]) {
                return match[2];
            }
        }

        return fallbackId;
    }

    /**
     * Read the canonical AI block data without changing it.
     *
     * @param block
     * @param editorConfig
     * @returns {{updateContext: *, data: *, rootData: *, rootId: *, contentBlockId: *, contentComponent: *}}
     */
    function readBlockData(block, editorConfig) {
        editorConfig = editorConfig || {};
        let updateContext = window.getDynamicBlockUpdateContext(block);
        let data = window.getComponentDataInStorageFormat(updateContext.component);
        data.blocks = data.blocks || {};
        let rootId = updateContext.component.attributes['block-id'];
        rootId = resolveSerializedBlockId(data, updateContext.component, rootId);
        let rootData = data.blocks[rootId] || {
            settings: {attributes: {}},
            blocks: {},
            html: '',
            is_html: false
        };
        if (rootId !== undefined) {
            data.blocks[rootId] = rootData;
        }
        // When an AI block is nested inside another dynamic block, the data
        // returned by PHPageBuilder starts at the outer block. Walk the same
        // relative-id path used by the normal rerender flow to reach the AI
        // block's own settings and content slot.
        updateContext.relativeIds.slice().reverse().forEach(function(relativeId) {
            if (rootData.blocks && rootData.blocks[relativeId]) {
                rootData = rootData.blocks[relativeId];
            }
        });
        let contentBlockId = editorConfig.content_block_id || 'content';
        let contentComponent = findNestedBlock(block, contentBlockId);

        return {
            updateContext: updateContext,
            data: data,
            rootData: rootData,
            rootId: rootId,
            contentBlockId: contentBlockId,
            contentComponent: contentComponent
        };
    }

    /**
     * Remove pagebuilder-only attributes before showing HTML in the source editor.
     * The stored content itself remains untouched.
     *
     * @param html
     * @returns {string}
     */
    function removePageBuilderAttributes(html) {
        let container = document.createElement('div');
        container.innerHTML = html || '';
        container.querySelectorAll('*').forEach(function(element) {
            [
                'block-id',
                'block-slug',
                'is-html',
                'wrapper',
                'style-identifier',
                'dropped-component-id',
                'data-gjs-type'
            ].forEach(function(attribute) {
                element.removeAttribute(attribute);
            });
        });
        return container.innerHTML;
    }

    function componentHtml(component) {
        return component ? removePageBuilderAttributes(component.toHTML()) : '';
    }

    function toString(value) {
        return value === undefined || value === null ? '' : String(value);
    }

    /**
     * Return the current source values used by the modal.
     *
     * @param block
     * @param editorConfig
     * @returns {{html: string, css: string, javascript: string, status: string}}
     */
    function getSourceValues(block, editorConfig) {
        let blockData = readBlockData(block, editorConfig);
        let settings = blockData.rootData.settings && blockData.rootData.settings.attributes
            ? blockData.rootData.settings.attributes
            : {};
        let nestedContent = blockData.rootData.blocks && blockData.rootData.blocks[blockData.contentBlockId]
            ? blockData.rootData.blocks[blockData.contentBlockId]
            : {};
        let html = toString(nestedContent.html);

        if (html === '' && blockData.contentComponent) {
            html = componentHtml(blockData.contentComponent);
        }
        if (html === '') {
            html = toString(settings.html);
        }

        return {
            html: removePageBuilderAttributes(html),
            css: toString(settings.css),
            javascript: toString(settings.javascript),
            status: toString(settings.generation_status)
        };
    }

    function getSelectedModel(block, editorConfig) {
        let blockData = readBlockData(block, editorConfig);
        let settings = blockData.rootData.settings && blockData.rootData.settings.attributes
            ? blockData.rootData.settings.attributes
            : {};

        return toString(settings.ai_model || '');
    }

    function getSelectedReasoningEffort(block, editorConfig) {
        let blockData = readBlockData(block, editorConfig);
        let settings = blockData.rootData.settings && blockData.rootData.settings.attributes
            ? blockData.rootData.settings.attributes
            : {};

        return toString(settings.ai_reasoning_effort || '');
    }

    function getGenerateUrl(editorConfig) {
        return editorConfig.generate_url || window.aiContentGenerateUrl ||
            (window.aiContentConfig && window.aiContentConfig.generate_url) || '';
    }

    /**
     * Return a compact, model-readable representation of the rendered layout
     * from <body> to the AI content insertion point.
     *
     * PHPageBuilder's phpb-block wrappers and editor-only attributes are
     * intentionally omitted. The generated content should see the actual
     * HTML/Bootstrap structure that already exists around it.
     *
     * @param component
     * @returns {string}
     */
    function getLayoutContext(component) {
        if (! component || ! component.ccid) {
            return '';
        }

        let frame = document.querySelector('.gjs-frame');
        let frameDocument = frame && frame.contentDocument;
        let blockElement = frameDocument && frameDocument.getElementById(component.ccid);
        if (! blockElement) {
            return '';
        }

        // Generated content is inserted into the AI block's body when it is
        // available. For an empty block, the block itself is the best stable
        // insertion marker until the first render creates that body.
        let targetElement = blockElement.querySelector('.ai-content-body') || blockElement;
        let path = [];
        let current = targetElement;

        while (current && current.nodeType === 1) {
            let tagName = current.tagName.toLowerCase();

            if (tagName !== 'phpb-block' && tagName !== 'script' && tagName !== 'style') {
                let classes = Array.from(current.classList || []).filter(function(className) {
                    return ! className.startsWith('gjs-') && ! className.startsWith('phpb-');
                });
                let descriptor = '<' + tagName;
                if (classes.length) {
                    descriptor += ' class="' + classes.join(' ') + '"';
                }
                descriptor += '>';
                path.unshift(descriptor);
            }

            if (current === frameDocument.body) {
                break;
            }
            current = current.parentElement;
        }

        if (! path.length || ! path[0].toLowerCase().startsWith('<body')) {
            path.unshift('<body>');
        }

        path.push('<AI_CONTENT_TARGET />');
        return path.map(function(line, index) {
            return '  '.repeat(index) + line;
        }).join('\n');
    }

    function showMessage(message, type) {
        let element = $('#phpb-ai-content-message');
        element.removeClass('alert-success alert-danger alert-warning alert-info');
        element.addClass('alert-' + (type || 'info'));
        element.text(message || '');
        if (message) {
            element.removeClass('d-none').show();
        } else {
            element.addClass('d-none').hide();
        }
    }

    function showWarnings() {}

    function setBusy(value, action) {
        isBusy = value;
        updateGenerateButtonState();
        $('#phpb-ai-content-generate-spinner').toggleClass('d-none', ! value || action !== 'generate');
        $('#phpb-ai-content-apply-spinner').toggleClass('d-none', ! value || action !== 'apply');
        updateApplyButtonState();
    }

    function createModal() {
        if ($('#phpb-ai-content-modal').length) {
            return;
        }

        $('body').append(`
<div class="modal fade" id="phpb-ai-content-modal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-xl" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Website aanpassen met AI</h5>
                <div class="d-flex align-items-center ml-auto">
                    <button type="button" id="phpb-ai-content-mode-toggle" class="btn btn-light border text-secondary px-3" data-ai-mode-toggle aria-label="Code bewerken">
                        <i class="fa fa-code mr-2" style="color:#6394c9" aria-hidden="true"></i><span>Code bewerken</span>
                    </button>
                    <button type="button" class="close" style="margin:0 0 0 30px;padding:0;outline:none;box-shadow:none" data-dismiss="modal" aria-label="Sluiten"><span aria-hidden="true">&times;</span></button>
                </div>
            </div>
            <div class="modal-body">
                <div id="phpb-ai-content-message" class="alert d-none" role="status"></div>
                <div class="phpb-ai-content-tab mt-3" data-ai-mode-pane="prompt">
                    <label id="phpb-ai-content-prompt-label" for="phpb-ai-content-prompt"><strong style="font-weight:500">Wat wil je maken?</strong></label>
                    <button type="button" id="phpb-ai-content-prompt-info-button" class="btn btn-link text-secondary p-0 ml-1" aria-label="Uitleg over de opdracht" data-toggle="tooltip" data-placement="top" title="Beschrijf wat je op de pagina wilt zien en plak hierbij eventueel de tekst die je wilt gebruiken."><i class="fa fa-info-circle" aria-hidden="true"></i></button>
                    <textarea id="phpb-ai-content-prompt" class="form-control" rows="7" aria-describedby="phpb-ai-content-prompt-error"></textarea>
                    <div id="phpb-ai-content-prompt-error" class="invalid-feedback">Vul eerst een opdracht in.</div>
                </div>
                <div class="phpb-ai-content-tab mt-3" data-ai-mode-pane="source" style="display:none">
                    <ul class="nav nav-tabs" role="tablist">
                        <li class="nav-item"><button class="nav-link active" type="button" data-ai-tab="html">HTML</button></li>
                        <li class="nav-item"><button class="nav-link" type="button" data-ai-tab="css">CSS</button></li>
                        <li class="nav-item"><button class="nav-link" type="button" data-ai-tab="javascript">JavaScript</button></li>
                    </ul>
                    <div class="phpb-ai-content-tab mt-3" data-ai-pane="html">
                        <label for="phpb-ai-content-html">HTML-fragment</label>
                        <textarea id="phpb-ai-content-html" class="form-control phpb-ai-content-source" rows="18" spellcheck="false"></textarea>
                    </div>
                    <div class="phpb-ai-content-tab mt-3" data-ai-pane="css" style="display:none">
                        <label for="phpb-ai-content-css">CSS voor dit blok</label>
                        <textarea id="phpb-ai-content-css" class="form-control phpb-ai-content-source" rows="18" spellcheck="false"></textarea>
                        <small class="form-text text-muted">De CSS wordt automatisch beperkt tot dit blok.</small>
                    </div>
                    <div class="phpb-ai-content-tab mt-3" data-ai-pane="javascript" style="display:none">
                        <label for="phpb-ai-content-javascript">JavaScript</label>
                        <textarea id="phpb-ai-content-javascript" class="form-control phpb-ai-content-source" rows="18" spellcheck="false"></textarea>
                        <small class="form-text text-muted">Gebruik aiContentRoot om dit blok te bereiken. JavaScript wordt uitgevoerd op de gepubliceerde pagina, niet in de PageBuilder zelf.</small>
                    </div>
                </div>
            </div>
            <div id="phpb-ai-content-footer" class="modal-footer">
                    <button id="phpb-ai-content-generate" type="button" class="btn btn-secondary" data-ai-mode-action="prompt" disabled>
                    Aanpassing maken<span id="phpb-ai-content-generate-spinner" class="spinner-border spinner-border-sm d-none ml-2" role="status" aria-hidden="true"></span>
                </button>
                <button id="phpb-ai-content-apply" type="button" class="btn btn-secondary" disabled>
                    Wijzigingen toepassen<span id="phpb-ai-content-apply-spinner" class="spinner-border spinner-border-sm d-none ml-2" role="status" aria-hidden="true"></span>
                </button>
            </div>
        </div>
    </div>
</div>`);

        $(document).on('click', '[data-ai-mode-toggle]', function() {
            let currentMode = $(this).attr('data-current-mode');
            setEditorMode(currentMode === 'prompt' ? 'source' : 'prompt');
        });

        $(document).on('click', '[data-ai-tab]', function() {
            let tab = $(this).data('ai-tab');
            $('[data-ai-tab]').removeClass('active');
            $(this).addClass('active');
            $('[data-ai-pane]').hide();
            $('[data-ai-pane="' + tab + '"]').show();
        });

        $('#phpb-ai-content-generate').on('click', generateContent);
        $('#phpb-ai-content-apply').on('click', applySourceChanges);
        $('#phpb-ai-content-prompt-info-button').tooltip({
            trigger: 'hover focus',
            placement: 'top'
        });
        $('#phpb-ai-content-html, #phpb-ai-content-css, #phpb-ai-content-javascript').on('input', updateApplyButtonState);
        $('#phpb-ai-content-prompt').on('input', function() {
            if ($(this).val().trim()) {
                $(this).removeClass('is-invalid').removeAttr('aria-invalid');
            }
            updateGenerateButtonState();
        });
    }

    function setEditorMode(mode) {
        let isPromptMode = mode === 'prompt';
        let toggleLabel = isPromptMode ? 'Code bewerken' : 'Bewerk met tekst';
        $('#phpb-ai-content-mode-toggle')
            .attr('data-current-mode', mode)
            .attr('aria-label', toggleLabel)
            .find('span').text(toggleLabel);
        $('#phpb-ai-content-mode-toggle i')
            .toggleClass('fa-code', isPromptMode)
            .toggleClass('fa-magic', ! isPromptMode);
        $('[data-ai-mode-pane]').hide();
        $('[data-ai-mode-pane="' + mode + '"]').show();
        $('#phpb-ai-content-generate').toggleClass('d-none', mode !== 'prompt');
        $('#phpb-ai-content-apply').toggleClass('d-none', mode !== 'source');
    }

    function hasSourceChanges() {
        return !! appliedSource && (
            $('#phpb-ai-content-html').val() !== appliedSource.html ||
            $('#phpb-ai-content-css').val() !== appliedSource.css ||
            $('#phpb-ai-content-javascript').val() !== appliedSource.javascript
        );
    }

    function hasExistingContent(source) {
        let container = document.createElement('div');
        container.innerHTML = source.html || '';
        container.querySelectorAll('.ai-content-body-fallback').forEach(function(element) {
            element.remove();
        });

        return container.innerHTML.trim() !== '' ||
            source.css.trim() !== '' ||
            source.javascript.trim() !== '';
    }

    function updateApplyButtonState() {
        let hasChanges = hasSourceChanges();

        $('#phpb-ai-content-apply')
            .toggleClass('btn-primary', !! hasChanges)
            .toggleClass('btn-secondary', ! hasChanges)
            .prop('disabled', isBusy || ! hasChanges);
    }

    function updateGenerateButtonState() {
        let hasPrompt = !! $('#phpb-ai-content-prompt').val().trim();

        $('#phpb-ai-content-generate')
            .toggleClass('btn-primary', hasPrompt)
            .toggleClass('btn-secondary', ! hasPrompt)
            .prop('disabled', isBusy || ! hasPrompt);
    }

    function stripRawContentMarkers(html) {
        return toString(html).replace(/(<[^<>]*?)\s+data-raw-content="true"([^<>]*>)/gi, '$1$2');
    }

    function populateModal(block, editorConfig) {
        let source = getSourceValues(block, editorConfig);
        source.html = stripRawContentMarkers(source.html);
        $('#phpb-ai-content-prompt-label strong').text(
            hasExistingContent(source) ? 'Wat wil je aanpassen?' : 'Wat wil je maken?'
        );
        $('#phpb-ai-content-html').val(source.html);
        $('#phpb-ai-content-css').val(source.css);
        $('#phpb-ai-content-javascript').val(source.javascript);
        appliedSource = {
            html: source.html,
            css: source.css,
            javascript: source.javascript
        };
        updateApplyButtonState();
        setEditorMode('prompt');
        $('[data-ai-tab="html"]').click();
        $('#phpb-ai-content-prompt').val('').removeClass('is-invalid').removeAttr('aria-invalid');
        updateGenerateButtonState();
        showMessage('', 'info');
        showWarnings([]);
    }

    function openEditor(block, editorConfig) {
        if (! block || ! editorConfig) {
            return;
        }
        activeBlock = block;
        activeEditorConfig = editorConfig;
        createModal();
        populateModal(block, editorConfig);
        $('#phpb-ai-content-modal').modal('show');
    }

    function restoreComponentToolbar(component) {
        if (! component || ! toolbarSnapshots.has(component)) {
            return;
        }

        component.set('toolbar', toolbarSnapshots.get(component));
        toolbarSnapshots.delete(component);
        if (decoratedComponent === component) {
            decoratedComponent = null;
        }
    }

    function bindCanvasPlaceholderAction() {
        let canvasDocument = window.editor.Canvas.getDocument();
        if (! canvasDocument || canvasDocument.__phpbAiContentActionBound) {
            return;
        }
        canvasDocument.__phpbAiContentActionBound = true;
        canvasDocument.addEventListener('click', function(event) {
            let target = event.target && event.target.nodeType === 1
                ? event.target
                : event.target && event.target.parentElement;
            let action = target && target.closest('[data-ai-content-open]');
            if (! action) {
                return;
            }

            event.preventDefault();
            let actionComponent = window.editor.getWrapper()
                .find('[data-ai-content-open]')
                .find(function(component) {
                    return component.getEl() === action;
                });
            let managedBlock = getManagedBlock(actionComponent);
            if (managedBlock) {
                openEditor(managedBlock.component, managedBlock.config);
                return;
            }

            // If the marker is rendered by a dynamic block and has no direct
            // GrapesJS component, let the canvas finish selecting its parent.
            setTimeout(function() {
                let selectedBlock = getManagedBlock(window.editor.getSelected());
                if (selectedBlock) {
                    openEditor(selectedBlock.component, selectedBlock.config);
                }
            }, 0);
        }, true);
    }

    function updateAiToolbar(component) {
        let managedBlock = getManagedBlock(component);

        if (decoratedComponent && decoratedComponent !== component) {
            restoreComponentToolbar(decoratedComponent);
        }

        if (managedBlock) {
            if (! toolbarSnapshots.has(component)) {
                let toolbar = component.get('toolbar') || [];
                toolbarSnapshots.set(component, toolbar.slice());
                component.set('toolbar', [{
                    attributes: {
                        class: 'fa fa-magic ' + aiToolbarClass,
                        title: managedBlock.config.label || 'AI-inhoud bewerken',
                        'aria-label': managedBlock.config.label || 'AI-inhoud bewerken'
                    },
                    command: 'open-ai-content-editor'
                }].concat(toolbar));
            }
            decoratedComponent = component;

            if (! isBusy && $('#phpb-ai-content-modal').hasClass('show') && activeBlock !== managedBlock.component) {
                activeBlock = managedBlock.component;
                activeEditorConfig = managedBlock.config;
                populateModal(activeBlock, activeEditorConfig);
            }
        } else if (! isBusy && $('#phpb-ai-content-modal').hasClass('show')) {
            $('#phpb-ai-content-modal').modal('hide');
            activeBlock = null;
            activeEditorConfig = null;
        }
    }

    function updateBlockValues(values, warnings, action) {
        if (! activeBlock || ! activeEditorConfig) {
            return;
        }

        // Keep the originating config stable while the server replaces the
        // dynamic component. GrapesJS selection events can temporarily clear
        // the active selection during that replacement.
        let editorConfig = activeEditorConfig;
        let closeAfterGeneration = action === 'generate';
        let blockData = readBlockData(activeBlock, editorConfig);
        let rootData = blockData.rootData;
        rootData.settings = rootData.settings || {};
        rootData.settings.attributes = rootData.settings.attributes || {};
        rootData.blocks = rootData.blocks || {};

        // Keep HTML in the nested HTML block. The ordinary html setting is a
        // backwards-compatible fallback for older pages and other renderers.
        let contentData = rootData.blocks[blockData.contentBlockId] || {
            settings: {},
            blocks: {},
            html: '',
            is_html: true
        };
        contentData.html = toString(values.html);
        contentData.is_html = true;
        rootData.blocks[blockData.contentBlockId] = contentData;

        rootData.settings.attributes.html = toString(values.html);
        rootData.settings.attributes.css = toString(values.css);
        rootData.settings.attributes.javascript = toString(values.javascript);
        rootData.settings.attributes.generation_status = 'ready';

        setBusy(true, action || 'apply');
        showMessage('', 'info');
        showWarnings(warnings || []);

        window.refreshDynamicBlock(
            blockData.updateContext.component,
            blockData.data,
            blockData.updateContext.relativeIds,
            {
                success: function(replacedComponent) {
                    activeBlock = replacedComponent;
                    activeEditorConfig = editorConfig;
                    setBusy(false);
                    if (closeAfterGeneration) {
                        $('#phpb-ai-content-modal').modal('hide');
                        return;
                    }
                    populateModal(activeBlock, editorConfig);
                    showWarnings(warnings || []);
                },
                error: function(xhr) {
                    setBusy(false);
                    let message = xhr && xhr.responseJSON && xhr.responseJSON.message
                        ? xhr.responseJSON.message
                        : 'De inhoud kon niet op het canvas worden toegepast.';
                    showMessage(message, 'danger');
                }
            }
        );
    }

    function generateContent() {
        if (! activeBlock || ! activeEditorConfig) {
            return;
        }

        let url = getGenerateUrl(activeEditorConfig);
        let promptField = $('#phpb-ai-content-prompt');
        let prompt = promptField.val().trim();
        showMessage('', 'info');
        promptField.removeClass('is-invalid').removeAttr('aria-invalid');
        if (! url) {
            showMessage('Er is geen eindpunt voor AI-generatie ingesteld.', 'danger');
            return;
        }
        if (! prompt) {
            promptField.addClass('is-invalid').attr('aria-invalid', 'true').trigger('focus');
            return;
        }

        let source = getSourceValues(activeBlock, activeEditorConfig);
        setBusy(true, 'generate');
        showWarnings([]);

        $.ajax({
            type: 'POST',
            url: url,
            dataType: 'json',
            data: {
                prompt: prompt,
                model: getSelectedModel(activeBlock, activeEditorConfig),
                reasoning_effort: getSelectedReasoningEffort(activeBlock, activeEditorConfig),
                context: {
                    block_slug: activeBlock.attributes['block-slug'],
                    current_html: source.html,
                    current_css: source.css,
                    current_javascript: source.javascript,
                    layout_context: getLayoutContext(activeBlock)
                }
            },
            success: function(response) {
                let generated = response && response.data ? response.data : response;
                generated = generated || {};
                $('#phpb-ai-content-html').val(toString(generated.html));
                $('#phpb-ai-content-css').val(toString(generated.css));
                $('#phpb-ai-content-javascript').val(toString(generated.javascript));
                updateApplyButtonState();
                updateBlockValues({
                    html: toString(generated.html),
                    css: toString(generated.css),
                    javascript: toString(generated.javascript)
                }, generated.warnings || [], 'generate');
            },
            error: function(xhr) {
                setBusy(false);
                let message = xhr && xhr.responseJSON && xhr.responseJSON.message
                    ? xhr.responseJSON.message
                    : 'AI-generatie is mislukt.';
                showMessage(message, 'danger');
            }
        });
    }

    function applySourceChanges() {
        if (! hasSourceChanges()) {
            return;
        }

        updateBlockValues({
            html: $('#phpb-ai-content-html').val(),
            css: $('#phpb-ai-content-css').val(),
            javascript: $('#phpb-ai-content-javascript').val()
        }, [], 'apply');
    }

    function initialize() {
        if (initialized || ! window.editor) {
            return;
        }
        initialized = true;
        window.phpbAiContentToolbarInitialized = true;
        createModal();
        window.editor.on('canvas:frame:load', bindCanvasPlaceholderAction);
        bindCanvasPlaceholderAction();

        window.editor.Commands.add('open-ai-content-editor', {
            run: function(editor) {
                let managedBlock = getManagedBlock(editor.getSelected());
                if (managedBlock) {
                    openEditor(managedBlock.component, managedBlock.config);
                }
            }
        });
        window.editor.on('component:selected', updateAiToolbar);
        window.editor.on('component:deselected', function(component) {
            restoreComponentToolbar(component);
            // GrapesJS emits deselection while it is transitioning between
            // components. Check the settled selection so switching between
            // children of the same AI block does not briefly close the editor.
            setTimeout(function() {
                updateAiToolbar(window.editor.getSelected());
            }, 0);
        });
        updateAiToolbar(window.editor.getSelected());
    }

    function waitForEditor() {
        if (window.editor) {
            initialize();
            return;
        }
        setTimeout(waitForEditor, 100);
    }

    waitForEditor();
})();
