$(document).ready(function() {

    $("#save-page").click(function(e) {
        e.preventDefault();
        let editor = window.editor;

        // get the page content container (so skip all layout) and prepare data for being stored
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
                console.log('Changes saved!');
            },
            error: function() {
            }
        });
    });

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

});
