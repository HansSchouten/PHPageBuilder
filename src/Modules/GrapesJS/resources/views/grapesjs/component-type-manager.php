<script type="text/javascript">

editor.DomComponents.addType('link', {
    model: {
        defaults: {
            traits: [],
            attributes: {},
        },
    },
});

const textType = editor.DomComponents.getType('text');
editor.DomComponents.addType('text', {
    model: textType.model,
    view: textType.view.extend({
        events: {
            click: 'onActive',
            touchend: 'onActive'
        },
    }),
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
