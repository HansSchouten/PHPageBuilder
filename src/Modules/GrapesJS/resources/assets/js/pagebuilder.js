window.onload = function() {
    let draggedBlock;

    window.editor.on('block:drag:start', function(block) {
        draggedBlock = block;
    });

    window.editor.on('block:drag:stop', function(droppedComponent) {
        // ensure component drop was successful
        if (! droppedComponent) return;

        let whitelistOnHtmlTag = draggedBlock.attributes.whitelist_on_tag;
        restrictEditAccess(whitelistOnHtmlTag, droppedComponent);

        // the droppedComponent itself should always be removable/draggable/copyable
        droppedComponent.set({
            removable: true,
            draggable: true,
            copyable: true,
            layerable: true,
            selectable: true,
            hoverable: true,
        });
    });

    /**
     * Function for only allowing edit access on whitelisted components.
     *
     * @param whitelistOnHtmlTag        whether edit access should be allowed based on the html tag
     * @param component
     */
    function restrictEditAccess(whitelistOnHtmlTag, component) {
        component.set({
            removable: false,
            draggable: false,
            droppable: false,
            badgable: false,
            stylable: false,
            highlightable: false,
            copyable: false,
            resizable: false,
            editable: false,
            layerable: false,
            selectable: false,
            hoverable: false
        });

        if (whitelistOnHtmlTag) {
            allowEditBasedOnTag(component);
        }
        allowEditBasedOnClass(component);

        // apply edit restrictions to sub components
        component.get('components').each(component => restrictEditAccess(whitelistOnHtmlTag, component));
    }

    function allowEditBasedOnTag(component) {
        let htmlTag = component.get('tagName');
        let editableTags = [
            'h1','h2','h3','h4','h5','h6','h7',
            'p','a','img','button','small','b','strong','i'
        ];

        if (editableTags.includes(htmlTag)) {
            component.set({
                hoverable: true,
                selectable: true,
                editable: true,
                layerable: false,
            })
        }
    }

    function allowEditBasedOnClass(component) {
        if ('phpb-editable' in component.attributes.attributes) {
            component.set({
                hoverable: true,
                selectable: true,
                editable: true,
                layerable: false,
            })
        }
    }

};
