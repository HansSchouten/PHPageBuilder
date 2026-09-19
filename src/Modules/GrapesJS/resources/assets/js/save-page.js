import { optimizePageStorage } from './page-storage-optimizer';

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
            window.pageData = {
                html: [],
                components: [],
                css: null,
                style: null
            };
            window.pageBlocks[window.currentLanguage] = [];

            // Clone every content container first. The storage optimizer is
            // intentionally allowed to mutate only these detached clones.
            let storedPage = getContainersContentInStorageFormat(
                window.editor.getWrapper().find("[phpb-content-container]")
            );

            storedPage.containers.forEach((data, index) => {

                window.pageData['html'][index] = data.html;
                window.pageData['components'][index] = data.components;

                window.pageBlocks[window.currentLanguage] = {...window.pageBlocks[window.currentLanguage], ...data.blocks};
                window.contentContainerComponents[index] = data.components;
            });

            window.pageData['style'] = storedPage.style;
            window.pageData['css'] = storedPage.css;

            if (callback) {
                callback();
            }
        }, 200);
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
     * Remove AI styles left behind by older AI blocks that rendered their
     * <style> tag as a sibling instead of keeping it inside the block root.
     * GrapesJS' normal style cleanup only sees CSS Composer rules, not these
     * inline HTML style components.
     */
    function removeOrphanedAiContentStyles(roots) {
        let activeScopes = {};
        let rootSet = new Set(roots);

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

            let components = component.get('components');
            if (components) {
                components.each(collectActiveScopes);
            }
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
                    && ! rootSet.has(parent)
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

        roots.forEach(collectActiveScopes);
        roots.forEach(removeOrphanedStyles);
    }

    /**
     * Save the data of all translation variants on the server.
     */
    function saveAllTranslationsToServer() {
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
        return withIsolatedComponentIds(function() {
            // Work with detached clones only. Appending the live component model
            // could otherwise move it or expose it to storage cleanup.
            let clones = cloneComponentsForStorage([component.parent(), component]);
            let container = clones[0];
            let componentClone = clones[1];

            // Remove all component's siblings since we only want to return the
            // selected component in storage format.
            container.get('components').reset();
            container.append(componentClone);

            let storedPage = optimizeAndSerializeStorageContainers([container]);
            let data = storedPage.containers[0];

            return {
                html: data.html,
                css: storedPage.css,
                components: data.components,
                blocks: data.blocks,
                style: storedPage.style,
            };
        });
    };

    /**
     * Clone, optimize and serialize page content without touching the component
     * models currently mounted in the GrapesJS editor.
     */
    function getContainersContentInStorageFormat(containers) {
        return withIsolatedComponentIds(function() {
            return optimizeAndSerializeStorageContainers(cloneComponentsForStorage(containers));
        });
    }

    /**
     * Optimize detached containers and serialize them while GrapesJS' live ID
     * registry is still hidden. Placeholder IDs can therefore never receive an
     * automatic -2 suffix because their live equivalents exist in the editor.
     */
    function optimizeAndSerializeStorageContainers(storageContainers) {
        let contentRoots = [];

        // This historical inline-style cleanup also runs on detached storage
        // clones, never on components mounted in the editor.
        removeOrphanedAiContentStyles(storageContainers);

        storageContainers.forEach(function(container) {
            let components = container.get('components');
            if (components && Array.isArray(components.models)) {
                components.models.forEach(function(component) {
                    contentRoots.push(component);
                });
            }
        });

        let optimized = optimizePageStorage({
            contentRoots: contentRoots,
            styleComponents: window.editor.getStyle(),
            // Other languages may contain block-local CSS or JavaScript that
            // refers to the shared style identifier. It is read only and is
            // never interpreted or rewritten by the optimizer.
            additionalCode: window.pageBlocks
        });

        return {
            containers: storageContainers.map(serializeStorageContainer),
            style: optimized.style,
            css: optimized.css
        };
    }

    /**
     * Temporarily hide GrapesJS' live ID registry for the complete storage
     * operation and restore that exact registry even when storage preparation
     * throws an error.
     */
    function withIsolatedComponentIds(callback) {
        let componentReferences = window.editor.DomComponents.componentsById;
        window.editor.DomComponents.componentsById = [];

        try {
            return callback();
        } finally {
            window.editor.DomComponents.componentsById = componentReferences;
        }
    }

    function cloneComponentsForStorage(components) {
        let componentList = Array.isArray(components)
            ? components
            : (components && Array.isArray(components.models) ? components.models : []);

        return componentList.map(function(component) {
            return window.cloneComponent(component);
        });
    }

    /**
     * Convert one already-cleaned clone to the persisted page format.
     */
    function serializeStorageContainer(container) {
        let blocksData = replaceDynamicBlocksWithPlaceholders(container).blocks;
        let html = window.html_beautify(getContainerHtml(container));
        let components = JSON.parse(JSON.stringify(container.get('components')));

        return {
            html: html,
            components: components,
            blocks: blocksData
        };
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
