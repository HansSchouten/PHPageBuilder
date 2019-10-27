$(document).ready(function() {

    $("#save-page").click(function() {
        let editor = window.editor;
        let page = $($.parseHTML(editor.getHtml()));
        console.log(editor.getComponents());
        prepareData(page);
    });

    function prepareData(page) {
        console.log(page.find('link'));
        page.find('[phpb-block]').each(function() {
            console.log($(this));
        });
    }

});
