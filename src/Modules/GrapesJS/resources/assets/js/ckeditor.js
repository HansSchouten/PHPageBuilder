$(document).ready(function() {

    window.CKEDITOR.on('dialogDefinition', function(ev) {
        let dialogName = ev.data.name;
        let dialogDefinition = ev.data.definition;
        if (dialogName === 'link') {
            let infoTab = dialogDefinition.getContents('info');
            let linkType = infoTab.get('linkType');

            // modify link type items
            linkType.items = [
                ["URL", "url"],
                ["Pagina", "page"],
                ["E-mail", "email"],
                ["Phone", "tel"],
            ];

            // store default link type onChange
            linkType['defaultOnChange'] = linkType.onChange;

            // define custom link type onChange
            linkType.onChange = function(obj) {
                let dialog = CKEDITOR.dialog.getCurrent();

                if (obj.data.value === 'page') {

                }

                // call default onChange
                $(this).trigger('defaultOnChange');
            };
        }
    });

});
