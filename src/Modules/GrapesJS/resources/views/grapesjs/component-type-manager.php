<script type="text/javascript">

let linkType = editor.DomComponents.getType('link');
editor.DomComponents.addType('link', {
    model: linkType.model.extend({
        defaults: Object.assign({}, linkType.model.prototype.defaults, {
            traits: [
                {
                    type: 'text',
                    label: 'URL',
                    name: 'href',
                },
                {
                    type: 'select',
                    label: '<?= phpb_trans('pagebuilder.trait-manager.link.target') ?>',
                    name: 'target',
                    options: [
                        {value: '_blank', name: '<?= phpb_trans('pagebuilder.yes') ?>'},
                        {value: '', name: '<?= phpb_trans('pagebuilder.no') ?>'},
                    ]
                }
            ],
        }),
    }, {
        isComponent: function(el) {
            if (el.tagName === 'A') {
                return {type: 'link'};
            }
        },
    }),
    view: linkType.view,
});

editor.DomComponents.addType('text', {
    model: {
        defaults: {
            traits: [],
            attributes: {},
        },
    },
});

editor.DomComponents.addType('default', {
    model: {
        defaults: {
            traits: [],
            attributes: {},
        },
    },
});

</script>
