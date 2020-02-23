$(document).ready(function() {

    window.CKEDITOR.on('instanceReady', function(event) {
        let editor = event.editor;

        // On pasting inside a CKEditor area, the page jumps down.
        // This code ensure the iframe page scroll remains the same
        editor.on('paste', function(event) {
            let $element = $(editor.element['$']);
            let $iframeDocument = $element.closest('body');
            $iframeDocument.animate({scrollTop: $iframeDocument.scrollTop()});
        });
    });

});
