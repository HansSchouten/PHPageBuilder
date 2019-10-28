(function() {
    let draggedBlock;

    /**
     * After loading the initial content of the page builder, restrict access to all layout components.
     * Only blocks and components inside the element with phpb-content-container attribute are editable.
     */
    window.editor.on('load', function(editor) {
        denyAccessToLayoutElements(editor.getWrapper());

        let container = editor.getWrapper().find("[phpb-content-container]")[0];

        // restrict edit access on child components of the content container
        restrictEditAccess(true, container);

        // modify edit access of the content container
        container.set({
            droppable: true,
            hoverable: true,
            removable: false,
            copyable: false,
        });
        container.set('custom-name', window.translations['page-content']);

        // the direct children of the content container are the added blocks, so add edit access to these components
        container.get('components').each(function(block) {
            block.set({
                removable: true,
                draggable: true,
                copyable: true,
                layerable: true,
                selectable: true,
                hoverable: true,
            });
        });
    });

    /**
     * Function for denying edit access to this component and all children that belong to the layout.
     *
     * @param component
     */
    function denyAccessToLayoutElements(component) {
        if ('phpb-content-container' in component.attributes.attributes) return;

        disableAllEditFunctionality(component);

        // apply restrictions to child components
        component.get('components').each(component => denyAccessToLayoutElements(component));
    }


    /**
     * On selecting a component, only show the copy/drag/remove toolbar if the component is draggable or removable.
     */
    window.editor.on('component:selected', function(component) {
        document.querySelector('.gjs-toolbar').classList.add('d-none');
        if (component.attributes.draggable || component.attributes.removable) {
            document.querySelector('.gjs-toolbar').classList.remove('d-none');
        }
    });

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
        disableAllEditFunctionality(component);

        if (whitelistOnHtmlTag) {
            allowEditBasedOnTag(component);
        }
        allowEditBasedOnClass(component);

        // apply edit restrictions to child components
        component.get('components').each(component => restrictEditAccess(whitelistOnHtmlTag, component));
    }

    function allowEditBasedOnTag(component) {
        let htmlTag = component.get('tagName');
        let editableTags = [
            'h1','h2','h3','h4','h5','h6','h7',
            'p','a','img','button','small','b','strong','i','em',
            'ul','li','th','td'
        ];

        if (editableTags.includes(htmlTag)) {
            component.set({
                hoverable: true,
                selectable: true,
                editable: true,
            })
        }
    }

    function allowEditBasedOnClass(component) {
        if ('phpb-editable' in component.attributes.attributes) {
            component.set({
                hoverable: true,
                selectable: true,
                editable: true,
            })
        }
    }

    function disableAllEditFunctionality(component) {
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
    }

})();
