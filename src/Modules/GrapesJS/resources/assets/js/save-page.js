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
        let container = editor.getWrapper().find("[phpb-content-container]")[0];
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
                html += '[block id="' + component.attributes['block-slug'] + '"]';
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
