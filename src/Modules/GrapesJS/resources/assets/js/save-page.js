$(document).ready(function() {

    $("#save-page").click(function() {
        let editor = window.editor;

        let pageHtml = $($.parseHTML(editor.getHtml()));

        let components = editor.getComponents();
        components.forEach(function(component) {
            console.log(component.attributes.tagName);
        });

        //prepareData(page);
    });

    function prepareData(page) {
        page.find('[phpb-block]').each(function() {
            console.log($(this));
        });
    }

});
