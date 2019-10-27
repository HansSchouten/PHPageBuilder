$(document).ready(function() {

    $("#save-page").click(function(e) {
        e.preventDefault();
        let editor = window.editor;

        // get the page content container (so skip all layout) and prepare data for being stored
        let container = editor.getWrapper().find("[phpb-content-container]")[0];
        let data = prepareData(container);

        $.ajax({
            type: "POST",
            url: $(this).data('url'),
            data: {
                data: data
            },
            success: function() {
                console.log('Changes saved!');
            },
            error: function() {
            }
        });
    });

    function prepareData(container) {
        let data = [];

        let blocks = container.get('components');
        blocks.forEach(function(component) {
            data.push(component.toHTML());
        });

        return data;
    }

});
