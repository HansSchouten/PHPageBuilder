$(document).ready(function() {

    window.CKEDITOR.on('dialogDefinition', function(event) {
        let dialogName = event.data.name;
        let dialogDefinition = event.data.definition;
        if (dialogName === 'link') {
            let infoTab = dialogDefinition.getContents('info');

            // modify link type items
            let linkType = infoTab.get('linkType');
            linkType.items = [
                ["Pagina", "page"],
                ["URL", "url"],
                ["E-mail", "email"],
                ["Phone", "tel"],
            ];

            // change link type selector based on selected link type
            linkType.default = 'page';
            linkType.setup = function(data) {
                if (data.type === undefined) {
                    this.setValue('page');
                } else if (data.type === 'url' && data.url.url.startsWith('[page id=')) {
                    this.setValue('page');
                } else {
                    this.setValue(data.type);
                }
            };

            // store default link type onChange
            linkType['defaultOnChange'] = linkType.onChange;

            // define custom link type onChange
            linkType.onChange = function(obj) {
                let dialog = CKEDITOR.dialog.getCurrent();

                if (obj.data.value === 'page') {
                    dialog.getContentElement('info', 'page-selector').getElement().show();
                } else {
                    dialog.getContentElement('info', 'page-selector').getElement().hide();
                }

                // call default onChange
                $(this).trigger('defaultOnChange');
            };

            infoTab.add({
                type: 'select',
                id: 'page-selector',
                label: 'Pagina',
                'default': '',
                style: 'width:100%',
                items: window.pages,
                onChange: function() {
                    let dialog = CKEDITOR.dialog.getCurrent();
                    let page = '[page id=' + this.getValue() + ']';
                    dialog.setValueOf('info', 'url', page);
                    dialog.setValueOf('info', 'protocol', ! page ? 'https://' : '');
                },
                setup: function(dialog) {
                    this.allowOnChange = false;
                    this.setValue(dialog.url ? dialog.url.url : '');
                    this.allowOnChange = true;
                }
            });

            /*
            dialogDefinition.onLoad = function() {
                let selector = this.getContentElement('info', 'page-selector');
                selector.reset();
            };*/
        }
    });

});
