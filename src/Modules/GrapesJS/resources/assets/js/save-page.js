$(document).ready(function() {

    $("#save-page").click(function() {
        let editor = window.editor;
        toggleWaiting();

        // get the page content container (so skip all layout blocks) and prepare data for being stored
        let container = editor.getWrapper().find("[phpb-content-container]")[0];
        let html = prepareHtml(container);
        let css = editor.getCss();

        $.ajax({
            type: "POST",
            url: $(this).data('url'),
            data: {
                data: {
                    css: css,
                    html: html
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
    });

    /**
     * Extract the html from all blocks inside the given container element.
     *
     * @param container
     * @returns {string}
     */
    function prepareHtml(container) {
        let html = '';

        let blocks = container.get('components');
        blocks.forEach(function(component) {
            console.log(component);
            console.log(component.toHTML());

            html += component.toHTML();
        });

        return html;
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
