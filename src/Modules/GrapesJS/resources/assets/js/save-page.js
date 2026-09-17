$(document).ready(function() {

    window.pageData = {};

    window.changesOffset = 0;
    window.onbeforeunload = confirmExit;
    function confirmExit() {
        let changesCount = window.editor.getModel().get('changesCount') - window.changesOffset;
        if (changesCount > 0) {
            return "Are you sure? There are unsaved changes.";
        }
    }

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
                error: function(error) {
                    callback();
                    console.log(error);
                    let errorMessage = error.statusText + ' ' + error.status;
                    errorMessage = error.responseJSON.message ? (errorMessage + ': "' + error.responseJSON.message + '"') : errorMessage;
                    window.toastr.error(errorMessage);
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
    function applyChangesFromCurrentLanguageToNewLanguage(newLanguage) {
        let newLanguageBlocks = window.pageBlocks[newLanguage];
        let currentLanguageBlocks = window.pageBlocks[window.currentLanguage];

        if (newLanguageBlocks === undefined) {
            newLanguageBlocks = currentLanguageBlocks;
        } else {
            updateNestedBlocks(currentLanguageBlocks, newLanguageBlocks);

            // copy missing blocks from the current language to the target language
            for (let blockId in currentLanguageBlocks) {
                if (newLanguageBlocks[blockId] === undefined) {
                    newLanguageBlocks[blockId] = currentLanguageBlocks[blockId];
                }
            }
        }

        // copy the content of blocks containers of the current language to the blocks containers of the new language
        for (let blockId in currentLanguageBlocks) {
            let $currentLanguageBlockHtmlDom = $("<container>" + currentLanguageBlocks[blockId]['html'] + "</container>");
            let $newLanguageBlockHtmlDom = $("<container>" + newLanguageBlocks[blockId]['html'] + "</container>");
            $currentLanguageBlockHtmlDom.find("[phpb-blocks-container]").each(function(index) {
                let currentLanguageBlockContainerHtml = $(this).html();
                $newLanguageBlockHtmlDom.find("[phpb-blocks-container]").eq(index).html(currentLanguageBlockContainerHtml);
            });
            newLanguageBlocks[blockId]['html'] = $newLanguageBlockHtmlDom.html();
        }

        window.pageBlocks[newLanguage] = newLanguageBlocks;
    }

    /**
     * Replace phpb-blocks-container html snippets if a block of the current language already exists in the target language.
     * This ensures all child blocks are present for all languages and they remain in the same order
     */
    function updateNestedBlocks(currentLanguageBlocks, newLanguageBlocks) {
        for (let blockId in currentLanguageBlocks) {
            // skip if the parent block does not yet exist in the target language
            if (newLanguageBlocks[blockId] === undefined) {
                continue;
            }

            for (let subBlockId in currentLanguageBlocks[blockId].blocks) {
                let updatedSubBlock = currentLanguageBlocks[blockId].blocks[subBlockId];
                let oldSubBlock = newLanguageBlocks[blockId].blocks[subBlockId];
                if (! updatedSubBlock || ! oldSubBlock) {
                    continue;
                }

                let updatedSubBlockMatches = updatedSubBlock.html.match(/phpb-blocks-container(.*)>(.*)</g);
                let oldSubBlockMatches = oldSubBlock.html.match(/phpb-blocks-container(.*)>(.*)</g);
                if (! updatedSubBlockMatches || ! oldSubBlockMatches) {
                    continue;
                }

                for (let i = 0; i < updatedSubBlockMatches.length; i++) {
                    newLanguageBlocks[blockId].blocks[subBlockId].html =
                        newLanguageBlocks[blockId].blocks[subBlockId].html.replace(oldSubBlockMatches[i], updatedSubBlockMatches[i]);
                }
            }
        }
    }

    /**
     * Store the all data of the current language locally for later use.
     *
     * @param callback
     */
    function saveCurrentTranslationLocally(callback) {
        // use timeout to ensure the waiting spinner is fully displayed before the page briefly freezes due to high JS workload
        setTimeout(function() {
            let existingCss = window.pageData['css'] ? window.pageData['css'] : window.initialCss;
            window.pageData = {
                html: [],
                components: [],
                css: null,
                style: null
            };
            window.pageBlocks[window.currentLanguage] = [];

            // get the data of each page content container (so skip all layout blocks) and prepare data for being stored
            window.editor.getWrapper().find("[phpb-content-container]").forEach((container, index) => {
                let data = getContainerContentInStorageFormat(container);

                window.pageData['html'][index] = data.html;
                window.pageData['components'][index] = data.components;

                window.pageBlocks[window.currentLanguage] = {...window.pageBlocks[window.currentLanguage], ...data.blocks};
                window.contentContainerComponents[index] = data.components;
            });

            // GrapesJS contains the complete rendered layout, including headers,
            // footers and its own protected CSS. Only persist rules referenced by
            // the page content we just serialized.
            let storedPageData = {
                components: window.pageData.components,
                blocks: window.pageBlocks
            };
            window.pageData['style'] = removeOldStyleSelectors(storedPageData, window.editor.getStyle());
            window.pageData['css'] = mergeCss(
                existingCss,
                getCssFromStyleComponents(window.pageData.style),
                window.pageBlocks
            );

            if (callback) {
                callback();
            }
        }, 200);
    }

    /**
     * Add all selectors from existingCss that are missing in newCss.
     * Backwards compatibility fix: losing CSS due to having different block style identifiers for different languages.
     */
    function mergeCss(existingCss, newCss, pageBlocks = window.pageBlocks) {
        if (! existingCss) {
            return newCss;
        }
        let pageBlocksString = JSON.stringify(pageBlocks || {});
        let regex = "\\.ID(.*?){(.*?)}"
        let matches = existingCss.match(new RegExp(regex, 'g'));
        if (! matches) {
            return newCss;
        }
        matches.forEach(function(css) {
            let selector = css.split('{')[0];
            let pageBlocksStringSelector = selector.replace('.', ' ').trim();
            if (newCss.indexOf(selector) === -1 && pageBlocksString.indexOf(pageBlocksStringSelector) >= 0) {
                newCss += css;
            }
        });
        return newCss;
    }

    /**
     * Remove all page blocks that are never referred to.
     */
    function removeOldPageBlocks(pageBlocks) {
        let htmlString = JSON.stringify(window.pageData.html);

        let pageBlocksCleaned = {};
        $.each(pageBlocks, (languageCode, languagePageBlocks) => {
            let blockStrings = {};
            $.each(languagePageBlocks, (blockId, blockData) => {
                blockStrings[blockId] = JSON.stringify(blockData);
            });

            let filteredLanguagePageBlocks = {};
            $.each(languagePageBlocks, (blockId, blockData) => {
                if (htmlString.includes(blockId)) {
                    filteredLanguagePageBlocks[blockId] = blockData;
                    return true; // continue
                }
                $.each(blockStrings, (otherBlockId, otherBlockString) => {
                    if (otherBlockString.includes(blockId)) {
                        filteredLanguagePageBlocks[blockId] = blockData;
                        return false; // break
                    }
                });
            });
            pageBlocksCleaned[languageCode] = filteredLanguagePageBlocks;
        });
        return pageBlocksCleaned;
    }

    /**
     * Remove style rules that are not referenced by the stored page content.
     *
     * GrapesJS manages the complete rendered layout in one component tree. Its
     * style collection therefore also contains generated rules for layout
     * elements. Stored components, block HTML and block style identifiers are
     * the authoritative list of selectors owned by the page itself.
     */
    function removeOldStyleSelectors(storedData, styleComponents) {
        let references = getStoredStyleReferences(storedData);

        return styleComponents.filter(function(styleComponent) {
            let style = styleComponent.get('style') || {};
            if (Object.keys(style).length === 0) {
                return false;
            }

            let selectors = styleComponent.get('selectors');
            if (! selectors || ! selectors.models.length) {
                return false;
            }

            return selectors.models.some(function(selector) {
                let name = selector.get('name');
                let type = selector.get('type');

                // GrapesJS selector types: 1 = class, 2 = id. Element and
                // universal selectors from the surrounding layout are not
                // page-owned style selectors.
                return (type === 1 && references.classes[name] === true)
                    || (type === 2 && references.ids[name] === true);
            });
        });
    }

    /**
     * Collect class and id selectors from serialized GrapesJS components and
     * page block data.
     */
    function getStoredStyleReferences(storedData) {
        let references = {classes: {}, ids: {}};
        collectStoredStyleReferences(storedData, references, null, new WeakSet());
        return references;
    }

    function collectStoredStyleReferences(value, references, key = null, visited = new WeakSet()) {
        if (typeof value === 'string') {
            if (key === 'style-identifier') {
                references.classes[value] = true;
            } else if (key === 'class') {
                addClassReferences(value, references);
            } else if (key === 'html') {
                collectHtmlStyleReferences(value, references);
            }
            return;
        }
        if (value === null || typeof value !== 'object') {
            return;
        }
        if (visited.has(value)) {
            return;
        }
        visited.add(value);

        if (key === 'classes' && Array.isArray(value)) {
            value.forEach(function(componentClass) {
                if (typeof componentClass === 'string') {
                    references.classes[componentClass] = true;
                } else if (componentClass && typeof componentClass.name === 'string') {
                    references.classes[componentClass.name] = true;
                }
            });
        }

        if (key === 'attributes') {
            if (typeof value.id === 'string' && value.id) {
                references.ids[value.id] = true;
            }
            if (typeof value.class === 'string') {
                addClassReferences(value.class, references);
            }
        }

        Object.keys(value).forEach(function(childKey) {
            collectStoredStyleReferences(value[childKey], references, childKey, visited);
        });
    }

    function collectHtmlStyleReferences(html, references) {
        if (! html || html.indexOf('<') === -1) {
            return;
        }

        let htmlDom = $("<container>" + html + "</container>");
        htmlDom.find('[id]').each(function() {
            references.ids[$(this).attr('id')] = true;
        });
        htmlDom.find('[class]').each(function() {
            addClassReferences($(this).attr('class') || '', references);
        });
    }

    function addClassReferences(classNames, references) {
        classNames.split(/\s+/).forEach(function(className) {
            if (className) {
                references.classes[className] = true;
            }
        });
    }

    /**
     * Generate CSS from the same filtered style models that are persisted.
     */
    function getCssFromStyleComponents(styleComponents) {
        return styleComponents.map(function(styleComponent) {
            return styleComponent.toCSS({important: styleComponent.get('important')});
        }).join('');
    }

    /**
     * Remove editor state that GrapesJS reconstructs while loading the page.
     * Generated ID... classes are retained only when CSS or block JavaScript
     * actually refers to them.
     */
    function cleanStoredGrapesJsData(data) {
        let referenceSources = [typeof data.css === 'string' ? data.css : ''];
        collectStyleIdentifierReferences(data.blocks, referenceSources);
        let references = referenceSources.join('\n');

        data.html = cleanStoredGrapesJsValue(data.html, references, 'html');
        data.components = cleanStoredGrapesJsValue(data.components, references, 'components');
        data.blocks = cleanStoredGrapesJsValue(data.blocks, references, 'blocks');
    }

    /**
     * Collect authored code, but not HTML declarations, that may intentionally
     * refer to a generated class. This includes block-level CSS and JavaScript.
     */
    function collectStyleIdentifierReferences(value, references, key = null) {
        let codeKeys = ['css', 'style', 'styles', 'javascript', 'js', 'script'];
        if (typeof value === 'string') {
            if (key !== null && codeKeys.indexOf(key.toLowerCase()) !== -1) {
                references.push(value);
            }
            return;
        }
        if (value === null || typeof value !== 'object') {
            return;
        }

        Object.keys(value).forEach(function(childKey) {
            collectStyleIdentifierReferences(value[childKey], references, childKey);
        });
    }

    function cleanStoredGrapesJsValue(value, references, key = null) {
        if (typeof value === 'string') {
            if (key === 'html') {
                return cleanStoredHtml(value, references);
            }
            if (key === 'class') {
                return cleanStyleIdentifierClassList(value, references);
            }
            if (key === 'data-raw-content') {
                return undefined;
            }
            if (key === 'style-identifier' && isUnusedStyleIdentifier(value, references)) {
                return undefined;
            }
            return value;
        }
        if (value === null || typeof value !== 'object') {
            return value;
        }

        if (Array.isArray(value)) {
            for (let index = value.length - 1; index >= 0; index--) {
                let cleanedValue = cleanStoredGrapesJsValue(value[index], references, key);
                if (key === 'classes' && typeof cleanedValue === 'string'
                    && isUnusedStyleIdentifier(cleanedValue, references)
                ) {
                    value.splice(index, 1);
                    continue;
                }
                value[index] = cleanedValue;
            }
            return value;
        }

        Object.keys(value).forEach(function(childKey) {
            let cleanedValue = cleanStoredGrapesJsValue(value[childKey], references, childKey);
            if (cleanedValue === undefined) {
                delete value[childKey];
            } else {
                value[childKey] = cleanedValue;
            }
        });
        return value;
    }

    function cleanStoredHtml(html, references) {
        let normalizedHtml = html.toLowerCase();
        if (normalizedHtml.indexOf('class=') === -1
            && normalizedHtml.indexOf('data-raw-content') === -1
        ) {
            return html;
        }

        let htmlDom = $("<container>" + html + "</container>");
        htmlDom.find('[data-raw-content]').each(function() {
            $(this).removeAttr('data-raw-content');
        });
        htmlDom.find('[class]').each(function() {
            let className = cleanStyleIdentifierClassList($(this).attr('class') || '', references);
            if (className) {
                $(this).attr('class', className);
            } else {
                $(this).removeAttr('class');
            }
        });
        return htmlDom.html();
    }

    function cleanStyleIdentifierClassList(className, references) {
        return className.split(/\s+/).filter(function(componentClass) {
            return componentClass && ! isUnusedStyleIdentifier(componentClass, references);
        }).join(' ');
    }

    function isUnusedStyleIdentifier(value, references) {
        if (! /^ID[A-Z0-9]{14,}$/i.test(value)) {
            return false;
        }

        let escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        let referencePattern = new RegExp('(^|[^A-Za-z0-9_-])' + escapedValue + '($|[^A-Za-z0-9_-])');
        return ! referencePattern.test(references);
    }

    /**
     * Remove AI styles left behind by older AI blocks that rendered their
     * <style> tag as a sibling instead of keeping it inside the block root.
     * GrapesJS' normal style cleanup only sees CSS Composer rules, not these
     * inline HTML style components.
     */
    function removeOrphanedAiContentStyles() {
        let wrapper = window.editor.getWrapper();
        let activeScopes = {};

        function collectActiveScopes(component) {
            let tagName = (component.get('tagName') || '').toLowerCase();
            if (tagName !== 'style' && typeof component.getClasses === 'function') {
                let classes = component.getClasses();
                if (classes.indexOf('ai-content-block') !== -1) {
                    let attributes = typeof component.getAttributes === 'function'
                        ? component.getAttributes()
                        : component.attributes.attributes || {};
                    if (attributes.id) {
                        activeScopes[attributes.id] = true;
                    }
                }
            }

            component.get('components').each(collectActiveScopes);
        }

        function removeOrphanedStyles(component) {
            let children = component.get('components');
            if (! children) {
                return;
            }

            children.models.slice().forEach(function(child) {
                let tagName = (child.get('tagName') || '').toLowerCase();
                if (tagName !== 'style') {
                    removeOrphanedStyles(child);
                    return;
                }

                let holder = document.createElement('div');
                holder.innerHTML = child.toHTML();
                let styleElement = holder.querySelector('style');
                let scope = styleElement ? styleElement.getAttribute('data-ai-content-style') : '';
                if (! scope || activeScopes[scope]) {
                    return;
                }

                let parent = child.parent();
                let parentIsGeneratedStyleWrapper = parent
                    && parent !== wrapper
                    && (parent.get('tagName') || '').toLowerCase() === 'div'
                    && typeof parent.getClasses === 'function'
                    && parent.getClasses().some(function(className) {
                        return /^ID[A-Z0-9]{10,}$/i.test(className);
                    })
                    && parent.get('components').length === 1;

                child.remove();
                if (parentIsGeneratedStyleWrapper) {
                    parent.remove();
                }
            });
        }

        collectActiveScopes(wrapper);
        removeOrphanedStyles(wrapper);
    }

    /**
     * Save the data of all translation variants on the server.
     */
    function saveAllTranslationsToServer() {
        removeOrphanedAiContentStyles();
        toggleSaving();

        saveCurrentTranslationLocally(function() {

            // update all language variants with the latest data of the current language we just saved locally
            $.each(window.languages, (languageCode, languageTranslation) => {
                if (languageCode !== window.currentLanguage) {
                    applyChangesFromCurrentLanguageToNewLanguage(languageCode);
                }
            });

            let data = window.pageData;
            data.blocks = removeOldPageBlocks(window.pageBlocks);
            data.style = removeOldStyleSelectors({
                components: data.components,
                blocks: data.blocks
            }, data.style);
            data.css = mergeCss(data.css, getCssFromStyleComponents(data.style), data.blocks);
            cleanStoredGrapesJsData(data);

            $.ajax({
                type: "POST",
                url: $("#save-page").data('url'),
                data: {
                    data: JSON.stringify(data)
                },
                success: function() {
                    toggleSaving();
                    window.toastr.success(window.translations['toastr-changes-saved']);

                    setTimeout(function() {
                        window.changesOffset = window.editor.getModel().get('changesCount');
                    }, 250);
                },
                error: function(error) {
                    toggleSaving();
                    console.log(error);
                    let errorMessage = error.statusText + ' ' + error.status;
                    errorMessage = error.responseJSON.message ? (errorMessage + ': "' + error.responseJSON.message + '"') : errorMessage;
                    window.toastr.error(errorMessage);
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
        // clone component's parent, enabling us to temporarily remove all component's siblings without updating the pagebuilder
        let container = window.cloneComponent(component.parent());

        // remove all component's siblings since we only want to return the given component in storage format
        container.get('components').reset();
        container.append(component);

        return getContainerContentInStorageFormat(container);
    };

    /**
     * Get the given container in storage format.
     *
     * @param container
     */
    function getContainerContentInStorageFormat(container) {
        // remove all existing references while cloning GrapesJS components,
        // this prevents GrapesJS from changing our IDs due to ID collisions
        let componentReferences = window.editor.DomComponents.componentsById;
        window.editor.DomComponents.componentsById = [];

        // we need to clone the container, since we will be replacing components with placeholders and we don't want to update the page builder
        container = window.cloneComponent(container);
        // replace each pagebuilder block for a shortcode and phpb-block element and return an array of all page blocks data
        let blocksData = replaceDynamicBlocksWithPlaceholders(container).blocks;

        let html = window.html_beautify(getContainerHtml(container));
        let components = JSON.parse(JSON.stringify(container.get('components')));

        let storedData = {
            html: html,
            components: components,
            blocks: blocksData
        };
        let style = removeOldStyleSelectors(storedData, window.editor.getStyle());
        let css = getCssFromStyleComponents(style);

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
    function getContainerHtml(container) {
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
     * Return the html representation of the given component.
     *
     * @param component
     */
    function getComponentHtml(component) {
        let htmlDom = $("<container>" + component.toHTML() + "</container>");
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
     * @param parentIsDynamic
     * @param parentIsHtmlInsideDynamic
     */
    function replaceDynamicBlocksWithPlaceholders(component, parentIsDynamic = false, parentIsHtmlInsideDynamic = false) {
        // data structure to be filled with the data of nested blocks via recursive calls
        let data = {
            current_block: {settings: {}, blocks: {}, html: "", is_html: false},
            blocks: {}
        };

        // update variables for passing context to the recursive calls on child components
        let newParentIsDynamic = parentIsDynamic;
        let newParentIsHtmlInsideDynamic = parentIsHtmlInsideDynamic;
        if (component.attributes['block-id'] !== undefined) {
            if (component.attributes['is-html'] === 'false') {
                newParentIsDynamic = true;
                newParentIsHtmlInsideDynamic = false;
            } else if (parentIsDynamic) {
                newParentIsDynamic = false;
                newParentIsHtmlInsideDynamic = true;
            }
        }

        // depth-first recursive call for replacing nested blocks (the deepest blocks are handled first)
        component.get('components').forEach(function(childComponent) {
            let childData = replaceDynamicBlocksWithPlaceholders(childComponent, newParentIsDynamic, newParentIsHtmlInsideDynamic);

            // update data object with child data
            for (let key in childData.current_block.blocks) { data.current_block.blocks[key] = childData.current_block.blocks[key]; }
            for (let key in childData.blocks) { data.blocks[key] = childData.blocks[key]; }
        });

        // if the method is called with a cloned container (which does not have a parent), this top-level component does not need any changes
        if (! component.parent()) {
            return data;
        }

        // if the component is not a block, no replacements need to be done
        if (component.attributes['block-id'] === undefined) {
            return data;
        }

        // do the actual replacement of this component with a placeholder component
        if (component.attributes['is-html'] === 'true') {
            if (parentIsDynamic) {
                // the full html content of html blocks directly inside a dynamic block should be stored in parent context using its block-id,
                // this is important because a dynamic block defines block ids and this can collide with block ids hardcoded in other dynamic blocks
                data.current_block['blocks'][component.attributes['block-id']] = {settings: {}, blocks: {}, html: window.html_beautify(getComponentHtml(component)), is_html: true};
            } else {
                // html blocks outside direct context of dynamic blocks should be stored as a block itself

                // store the block's style-identifier
                // this will be used as class in a wrapper around the dynamic block to give the block its styling
                if (component.attributes['style-identifier'] !== undefined) {
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
                data.blocks[instanceId] = {settings: data.current_block['settings'], blocks: {}, html: window.html_beautify(getComponentHtml(component)), is_html: true};
                data.current_block = {settings: {}, blocks: {}, html: "", is_html: false};
            }
        } else {
            // store the attributes set to this block using traits in the settings side panel
            let attributes = {};
            component.get('traits').each(function(trait) {
                attributes[trait.get('name')] = trait.getTargetValue();
            });
            data.current_block['settings']['attributes'] = attributes;

            // store the block's style-identifier
            // this will be used as class in a wrapper around the dynamic block to give the block its styling
            if (component.attributes['style-identifier'] !== undefined) {
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
            if (parentIsDynamic) {
                // inside a dynamic block, the block data is passed to the context of its parent block (so current_block is used)
                let currentBlockForParent = {settings: {}, blocks: {}, html: "", is_html: false};
                currentBlockForParent['blocks'][component.attributes['block-id']] = data.current_block;
                data.current_block = currentBlockForParent;
            } else {
                // outside dynamic blocks, the block data is globally stored in the blocks array
                data.blocks[instanceId] = data.current_block;
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
