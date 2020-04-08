$(document).ready(function() {

    let editorCss = '';

    window.pageData = {};
    window.pageTranslationData = {};

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
            window.editor.store(); // text-editor updates are not applied until focus is lost, so force update
            saveAllTranslationsToServer();
            e.preventDefault();
            return false;
        }
    });

    window.switchLanguage = function(newLanguage, callback) {
        saveCurrentTranslation(function() {
            window.pageComponents = window.pageData.components;
            window.dynamicBlocks[newLanguage] = window.pageTranslationData[window.currentLanguage];
            callback();
        });
    };

    function saveCurrentTranslation(callback) {
        toggleWaiting();

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
            window.pageTranslationData[window.currentLanguage] = data.blocks;
            window.pageComponents = data.components;

            toggleWaiting();
            if (callback) {
                callback();
            }

        }, 200);
    };

    function saveAllTranslationsToServer() {
        saveCurrentTranslation(function() {
            toggleWaiting();

            let data = window.pageData;
            data.blocks = window.pageTranslationData;

            $.ajax({
                type: "POST",
                url: $("#save-page").data('url'),
                data: {
                    data: JSON.stringify(data)
                },
                success: function() {
                    toggleWaiting();
                    window.toastr.success(window.translations['toastr-changes-saved']);
                },
                error: function () {
                    toggleWaiting();
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
        // clone the container since we will be replacing components with placeholders without updating the page builder
        container = window.cloneComponent(container);
        // save editor css, used in replaceDynamicBlocksWithPlaceholders to check whether a component has received styling
        editorCss = window.editor.getCss();
        // replace each dynamic block for a shortcode and phpb-block element and return an array of all dynamic block data
        let blocksData = replaceDynamicBlocksWithPlaceholders(container).blocks;

        let html = window.html_beautify(getHtml(container));
        let css = window.editor.getCss();
        let style = window.editor.getStyle();
        let components = JSON.parse(JSON.stringify(container.get('components')));

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
        let data = {};
        data['current_block'] = {};
        data['blocks'] = {};

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
            for (let id in childData.current_block) { data.current_block[id] = childData.current_block[id]; }
            for (let id in childData.blocks) { data.blocks[id] = childData.blocks[id]; }
        });

        // if this component is a dynamic block, do the actual replacement of this component with a placeholder component
        if (component.attributes['block-id'] !== undefined) {
            if (inDynamicBlock && component.attributes['is-html'] === 'true' && inHtmlBlockInDynamicBlock === false) {
                // the full html content of html blocks directly inside a dynamic block should be stored using its block-id
                data.current_block[component.attributes['block-id']] = window.html_beautify(component.toHTML());
            } else if (component.attributes['is-html'] === 'false') {
                // store the attributes set to this block using traits in the settings side panel
                let attributes = {};
                component.get('traits').each(function(trait) {
                    attributes[trait.get('name')] = trait.getTargetValue();
                });
                data.current_block['attributes'] = attributes;

                // if the block has received styling, store its style-identifier
                // this will be used as class in a wrapper around the dynamic block to give the block its styling
                if (component.attributes['style-identifier'] !== undefined && editorCss.includes(component.attributes['style-identifier'])) {
                    data.current_block['attributes']['style-identifier'] = component.attributes['style-identifier'];
                }

                // replace this dynamic component by a shortcode with a unique id
                // and store data.current_block data inside data.blocks with the unique id we just generated
                let instanceId = generateId();
                component.replaceWith({
                    tagName: 'phpb-block',
                    attributes: {
                        slug: component.attributes['block-slug'],
                        id: instanceId
                    }
                });

                if (inDynamicBlock) {
                    // inside a dynamic block, the block data is passed to the context of its parent block (so current_block is used)
                    let currentBlockForParent = {};
                    currentBlockForParent[component.attributes['block-id']] = data.current_block;
                    data.current_block = currentBlockForParent;
                } else {
                    // in an html block, the block data is globally stored in the blocks array
                    data.blocks[instanceId] = data.current_block;
                    data.current_block = {};
                }
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
     * Toggle the save button waiting status.
     */
    function toggleWaiting() {
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
