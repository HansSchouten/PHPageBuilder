$(document).ready(function() {

    let editorCss = '';

    window.pageData = {};

    /**
     * Save page on clicking save button.
     */
    $("#save-page").click(function() {
        saveAllTranslationsToServer();
    });

    /**
     * Save page on Ctrl + S.
     */
    $(document).bind("keydown", function(e){
        if(e.ctrlKey && e.which === 83) {
            // text-editor updates are not applied until focus is lost, so force GrapesJS update
            window.editor.store();

            saveAllTranslationsToServer();
            e.preventDefault();
            return false;
        }
    });

    /**
     * Switch the pagebuilder to the given language.
     * This stores the all data of the current language locally for later use and renders the given language variant on the server.
     *
     * @param newLanguage
     * @param callback
     */
    window.switchLanguage = function(newLanguage, callback) {
        window.setWaiting(true);

        saveCurrentTranslationLocally(function() {
            applyChangesFromCurrentLanguageToNewLanguage(newLanguage);

            let data = window.pageData;
            data.blocks = {[newLanguage]: window.pageBlocks[newLanguage]};

            // render the language variant server-side
            $.ajax({
                type: "POST",
                url: window.renderLanguageVariantUrl,
                data: {
                    data: JSON.stringify(data),
                    language: newLanguage
                },
                success: function(response) {
                    response = JSON.parse(response);
                    window.pageBlocks[newLanguage] = response.dynamicBlocks ? response.dynamicBlocks : {};
                    callback();
                },
                error: function() {
                    callback();
                    window.toastr.error(window.translations['toastr-switching-language-failed']);
                }
            });
        });
    };

    /**
     * Copy new blocks of the current language to the new language or remove old blocks from the new language.
     *
     * @param newLanguage
     */
    function applyChangesFromCurrentLanguageToNewLanguage(newLanguage)
    {
        let newLanguageBlocks = window.pageBlocks[newLanguage];
        let currentLanguageBlocks = window.pageBlocks[window.currentLanguage];

        if (newLanguageBlocks === undefined) {
            newLanguageBlocks = currentLanguageBlocks;
        } else {
            // copy missing blocks from the current language to the target language
            for (let blockId in currentLanguageBlocks) {
                if (newLanguageBlocks[blockId] === undefined) {
                    newLanguageBlocks[blockId] = currentLanguageBlocks[blockId];
                }
            }
            // remove blocks from the target language that have been removed in the current language
            for (let blockId in newLanguageBlocks) {
                if (currentLanguageBlocks[blockId] === undefined) {
                    delete newLanguageBlocks[blockId];
                }
            }
        }

        window.pageBlocks[newLanguage] = newLanguageBlocks;
    }

    /**
     * Store the all data of the current language locally for later use.
     *
     * @param callback
     */
    function saveCurrentTranslationLocally(callback) {
        // use timeout to ensure the waiting spinner is fully displayed before the page briefly freezes due to high JS workload
        setTimeout(function() {

            // get the page content container (so skip all layout blocks) and prepare data for being stored
            let container = window.editor.getWrapper().find("[phpb-content-container]")[0];
            let data = getDataInStorageFormat(container);

            window.pageData = {
                html: data.html,
                components: data.components,
                css: data.css,
                style: data.style,
            };
            window.pageBlocks[window.currentLanguage] = data.blocks;
            window.pageComponents = data.components;

            if (callback) {
                callback();
            }
        }, 200);
    }

    /**
     * Save the data of all translation variants on the server.
     */
    function saveAllTranslationsToServer() {
        toggleSaving();

        saveCurrentTranslationLocally(function() {

            // update all language variants with the latest data of the current language we just saved locally
            window.languages.forEach(language => {
                if (language !== window.currentLanguage) {
                    applyChangesFromCurrentLanguageToNewLanguage(language);
                }
            });

            let data = window.pageData;
            data.blocks = window.pageBlocks;

            $.ajax({
                type: "POST",
                url: $("#save-page").data('url'),
                data: {
                    data: JSON.stringify(data)
                },
                success: function() {
                    toggleSaving();
                    window.toastr.success(window.translations['toastr-changes-saved']);
                },
                error: function() {
                    toggleSaving();
                    window.toastr.error(window.translations['toastr-saving-failed']);
                }
            });
        });
    }

    /**
     * Get the given component in storage format (in context of its container with all siblings removed).
     *
     * @param component
     */
    window.getComponentDataInStorageFormat = function(component) {
        // clone component's parent to enable us removing all component's siblings
        let container = window.cloneComponent(component.parent());

        // remove all component's siblings since we only want to return the given component in storage format
        container.get('components').reset();
        container.append(component);

        return getDataInStorageFormat(container);
    };

    /**
     * Get the given container in storage format.
     *
     * @param container
     */
    function getDataInStorageFormat(container) {
        // remove all existing references while cloning GrapesJS components,
        // this prevents GrapesJS from changing our IDs due to ID collisions
        let componentReferences = window.editor.DomComponents.componentsById;
        window.editor.DomComponents.componentsById = [];

        // clone the container since we will be replacing components with placeholders without updating the page builder
        container = window.cloneComponent(container);
        // save editor css, used in replaceDynamicBlocksWithPlaceholders to check whether a component has received styling
        editorCss = window.editor.getCss();
        // replace each pagebuilder block for a shortcode and phpb-block element and return an array of all page blocks data
        let blocksData = replaceDynamicBlocksWithPlaceholders(container).blocks;

        let html = window.html_beautify(getHtml(container));
        let css = window.editor.getCss();
        let style = window.editor.getStyle();
        let components = JSON.parse(JSON.stringify(container.get('components')));

        // switch back to original GrapesJS component references
        window.editor.DomComponents.componentsById = componentReferences;

        return {
            html: html,
            css: css,
            components: components,
            blocks: blocksData,
            style: style,
        }
    }

    /**
     * Return the html representation of the contents of the given container.
     *
     * @param container
     */
    function getHtml(container) {
        let html = '';
        container.get('components').forEach(component => html += component.toHTML());
        let htmlDom = $("<container>" + html + "</container>");
        // replace phpb-block elements with shortcode
        htmlDom.find('phpb-block').each(function() {
            $(this).replaceWith('[block slug="' + $(this).attr('slug') + '" id="' + $(this).attr('id') + '"]');
        });
        return htmlDom.html();
    }

    /**
     * Replace all blocks with is-html === false with a <phpb-block> component that contains all block attributes.
     *
     * @param component
     * @param inDynamicBlock
     * @param inHtmlBlockInDynamicBlock
     */
    function replaceDynamicBlocksWithPlaceholders(component, inDynamicBlock = false, inHtmlBlockInDynamicBlock = false) {
        // data structure to be filled with the data of nested blocks via recursive calls
        let data = {
            current_block: {settings: {}, blocks: {}, html: "", is_html: false},
            blocks: {}
        };

        // update variables for passing context to the recursive calls on child components
        let newInDynamicBlock = inDynamicBlock;
        let newInHtmlBlockInDynamicBlock = inHtmlBlockInDynamicBlock;
        if (component.attributes['block-id'] !== undefined) {
            if (component.attributes['is-html'] === 'false') {
                newInDynamicBlock = true;
                newInHtmlBlockInDynamicBlock = false;
            } else if (inDynamicBlock && component.attributes['is-html'] === 'true') {
                newInHtmlBlockInDynamicBlock = true;
            }
        }

        // depth-first recursive call for replacing nested blocks (the deepest blocks are handled first)
        component.get('components').forEach(function(childComponent) {
            let childData = replaceDynamicBlocksWithPlaceholders(childComponent, newInDynamicBlock, newInHtmlBlockInDynamicBlock);

            // update data object with child data
            for (let key in childData.current_block.blocks) { data.current_block.blocks[key] = childData.current_block.blocks[key]; }
            for (let key in childData.blocks) { data.blocks[key] = childData.blocks[key]; }
        });

        // if this component is a pagebuilder block, do the actual replacement of this component with a placeholder component
        if (component.attributes['block-id'] !== undefined) {
            if (inDynamicBlock && component.attributes['is-html'] === 'true' && inHtmlBlockInDynamicBlock === false) {
                // the full html content of html blocks directly inside a dynamic block should be stored using its block-id
                data.current_block['blocks'][component.attributes['block-id']] = {settings: {}, blocks: {}, html: window.html_beautify(component.toHTML()), is_html: true};
            } else if (component.attributes['is-html'] === 'false') {
                // store the attributes set to this block using traits in the settings side panel
                let attributes = {};
                component.get('traits').each(function(trait) {
                    attributes[trait.get('name')] = trait.getTargetValue();
                });
                data.current_block['settings']['attributes'] = attributes;

                // if the block has received styling, store its style-identifier
                // this will be used as class in a wrapper around the dynamic block to give the block its styling
                if (component.attributes['style-identifier'] !== undefined && editorCss.includes(component.attributes['style-identifier'])) {
                    data.current_block['settings']['attributes']['style-identifier'] = component.attributes['style-identifier'];
                }

                // replace this dynamic component by a shortcode with a unique id
                let instanceId = component.attributes['block-id'];
                if (! component.attributes['block-id'].startsWith('ID')) {
                    instanceId = generateId();
                }
                component.replaceWith({
                    tagName: 'phpb-block',
                    attributes: {
                        slug: component.attributes['block-slug'],
                        id: instanceId
                    }
                });

                // store data.current_block data inside data.blocks with the unique id we just generated
                if (inDynamicBlock) {
                    // inside a dynamic block, the block data is passed to the context of its parent block (so current_block is used)
                    let currentBlockForParent = {settings: {}, blocks: {}, html: "", is_html: false};
                    currentBlockForParent['blocks'][component.attributes['block-id']] = data.current_block;
                    data.current_block = currentBlockForParent;
                } else {
                    // in an html block, the block data is globally stored in the blocks array
                    data.blocks[instanceId] = data.current_block;
                    data.current_block = {settings: {}, blocks: {}, html: "", is_html: false};
                }
            } else if (component.attributes['is-html'] === 'true' && inDynamicBlock === false) {
                // html blocks outside the context of dynamic blocks should be stored as a block itself (to allow for translations instead of just hard-coding the html)

                // if the block has received styling, store its style-identifier
                // this will be used as class in a wrapper around the dynamic block to give the block its styling
                if (component.attributes['style-identifier'] !== undefined && editorCss.includes(component.attributes['style-identifier'])) {
                    data.current_block['settings']['attributes'] = {'style-identifier': component.attributes['style-identifier']};
                }

                // replace this html component by a shortcode with a unique id
                let instanceId = component.attributes['block-id'];
                if (! component.attributes['block-id'].startsWith('ID')) {
                    instanceId = generateId();
                }
                component.replaceWith({
                    tagName: 'phpb-block',
                    attributes: {
                        slug: component.attributes['block-slug'],
                        id: instanceId
                    }
                });

                // store the block data globally in the blocks array
                data.blocks[instanceId] = {settings: data.current_block['settings'], blocks: {}, html: window.html_beautify(component.toHTML()), is_html: true};
                data.current_block = {settings: {}, blocks: {}, html: "", is_html: false};
            }
        }

        return data;
    }

    /**
     * Generate a unique id string.
     *
     * Based on: https://gist.github.com/gordonbrander/2230317
     */
    let counter = 0;
    function generateId() {
        return 'ID' + (Date.now().toString(36)
            + Math.random().toString(36).substr(2, 5) + counter++).toUpperCase();
    }

    /**
     * Set the page builder waiting status.
     */
    window.setWaiting = function(value) {
        let wrapper = window.editor.DomComponents.getWrapper();
        if (value) {
            wrapper.addClass("gjs-waiting");
        } else {
            wrapper.removeClass("gjs-waiting");
        }
    };

    /**
     * Toggle the save button waiting status.
     */
    function toggleSaving() {
        let button = $("#save-page");
        button.blur();

        if (button.hasClass('waiting')) {
            button.attr("disabled", false);
            button.removeClass('waiting');
            button.find('.spinner-border').addClass('d-none');
        } else {
            button.attr("disabled", true);
            button.addClass('waiting');
            button.find('.spinner-border').removeClass('d-none');
        }
    }

});
