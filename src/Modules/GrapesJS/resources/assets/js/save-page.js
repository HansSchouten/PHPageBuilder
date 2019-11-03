$(document).ready(function() {

    /**
     * Save page on clicking save button.
     */
    $("#save-page").click(function() {
        savePage();
    });

    /**
     * Save page on Ctrl + S
     */
    $(document).bind("keydown", function(e){
        if(e.ctrlKey && e.which === 83) {
            savePage();
            e.preventDefault();
            return false;
        }
    });

    function savePage() {
        let editor = window.editor;
        toggleWaiting();

        // get the page content container (so skip all layout blocks) and prepare data for being stored
        let container = editor.getWrapper().find("[phpb-content-container]")[0].clone();
        let blocksData = replaceDynamicBlocksWithPlaceholders(container).blocks;

        let html = getHtml(container);
        let components = getComponents(container);

        let css = editor.getCss();
        let style = editor.getStyle();

        $.ajax({
            type: "POST",
            url: $("#save-page").data('url'),
            data: {
                data: {
                    html: html,
                    css: css,
                    components: JSON.stringify(components),
                    blocks: JSON.stringify(blocksData),
                    style: JSON.stringify(style),
                }
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

        // depth first recursive call for replacing nested blocks (this happens before the higher level blocks are handled)
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
                data.current_block[component.attributes['block-id']] = component.toHTML();
            } else if (component.attributes['is-html'] === 'false') {
                // if the current component is a dynamic block, replace this component with a placeholder with a unique id
                // and store data.current_block data inside data.blocks with the generated id
                let instanceId = generateId();
                component.replaceWith({
                    tagName: 'phpb-block',
                    'block-slug': component.attributes['block-slug'],
                    'block-id': component.attributes['block-id'],
                    'is-html': 'false',
                    'data-id': instanceId
                });
                data.blocks[instanceId] = data.current_block;
                data.current_block = {};
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
     * Extract the html from all blocks inside the given container element.
     *
     * @param container
     */
    function getHtml(container) {
        let html = '';

        let components = container.get('components');
        components.forEach(function(component) {

            if (component.attributes['block-slug'] !== undefined) {
                console.log(1);
            }

            if (component.attributes['is-html']) {
                let subHtml = '';
                component.get('components').each(component => subHtml += component.toHTML());
                html += subHtml;
            } else {
                html += '[block slug="' + component.attributes['block-slug'] + '"]';
            }

        });

        return html;
    }

    /**
     * Extract the json representation of the components inside the given container.
     *
     * @param container
     */
    function getComponents(container) {
        let components = [];

        let blocks = container.get('components');
        blocks.forEach(function(component) {

            if (component.attributes['is-html']) {
                components.push(component.toJSON());
            } else {
                components.push(component.toJSON());
            }

        });

        return components;
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
