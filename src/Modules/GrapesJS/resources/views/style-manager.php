<script type="text/javascript">

let styleManager = editor.StyleManager;
styleManager.addProperty("Typography", {
    name: "Vertical Align",
    property: "vertical-align",
    type: "select",
    default: "auto",
    list: [{
        value: "auto",
        name: "auto"
    }, {
        value: "top !important",
        name: "top"
    },
        {
            value: "middle !important",
            name: "middle"
        },
        {
            value: "bottom !important",
            name: "bottom"
        }
    ]
});

styleManager.addSector('location',{
    name: 'Locatie',
    open: false,
    properties: [
        {
            name: 'My property'
        }
    ]
}, { at: 0 });

</script>
