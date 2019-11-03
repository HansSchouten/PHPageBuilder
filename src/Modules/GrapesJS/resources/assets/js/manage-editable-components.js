(function() {

    /**
     * After loading the initial content of the page builder, restrict access to all layout components.
     * Only blocks and components inside the element with phpb-content-container attribute are editable.
     */
    window.editor.on('load', function(editor) {
        denyAccessToLayoutElements(editor.getWrapper());

        let container = editor.getWrapper().find("[phpb-content-container]")[0];
        container.set('custom-name', window.translations['page-content']);
        restrictEditAccess(container);

        // add all previously stored page components inside the content container
        container.components(window.pageComponents);
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

    window.editor.on('block:drag:stop', function(droppedComponent) {
        // ensure component drop was successful
        if (! droppedComponent) return;

        let parent = droppedComponent.parent();

        applyBlockAttributesToComponents(droppedComponent, true);
        restrictEditAccess(parent);
    });

    /**
     * Apply the block attributes which are stored in <phpb-block> elements to the top-level html element of the block.
     * If the block starts with multiple html elements at top-level, add a div element wrapping the block's top-level elements.
     *
     * @param component
     */
    function applyBlockAttributesToComponents(component) {
        if (component.attributes.tagName === 'phpb-block') {
            let container = component.parent();
            let clone = component.clone();

            // Since component is a <phpb-block> that should be removed and replaced by its children,
            // the component's parent child that has the same id as component needs to be replaced.
            let blockRootComponent;
            container.components().each(function(componentSibling) {
                if (componentSibling.cid === component.cid) {
                    if (component.components().length === 1) {
                        blockRootComponent = component.components().models[0].clone();
                        component.replaceWith(blockRootComponent);
                    } else {
                        // if the phpb-block has multiple direct children, add a wrapper first
                        blockRootComponent = component.replaceWith({tagName: 'div'});
                        clone.components().each(function(componentChild) {
                            blockRootComponent.append(componentChild.clone());
                        });
                    }
                }
            });

            applyBlockAttributes(clone, blockRootComponent);

            // recursive call to find and replace <phpb-block> elements of nested blocks (loaded via shortcodes)
            applyBlockAttributesToComponents(blockRootComponent);
        } else {
            component.components().each(function(childComponent) {
                // recursive call to find and replace <phpb-block> elements of nested blocks (loaded via shortcodes)
                applyBlockAttributesToComponents(childComponent);
            });
        }
    }

    /**
     * Apply the attributes of the given component to the given target component.
     *
     * @param phpbComponent
     * @param component
     */
    function applyBlockAttributes(phpbComponent, component) {
        let componentAttributes = phpbComponent.attributes.attributes;
        for (var attribute in componentAttributes) {
            if (componentAttributes.hasOwnProperty(attribute)) {
                component.attributes[attribute] = componentAttributes[attribute];
            }
        }
    }

    /**
     * Function for only allowing edit access on whitelisted components.
     *
     * @param component
     * @param allowEditWhitelistedTags
     */
    function restrictEditAccess(component, allowEditWhitelistedTags = false) {
        disableAllEditFunctionality(component);

        if (component.attributes.attributes['phpb-content-container'] !== undefined) {
            component.set({
                droppable: true,
                hoverable: true,
            });
        } else if (component.attributes['block-slug'] !== undefined) {
            let permissions = {
                removable: true,
                draggable: true,
                copyable: true,
                layerable: true,
                selectable: true,
                hoverable: true,
            };
            if (component.attributes['is-html'] === 'true') {
                permissions.editable = true;
                allowEditWhitelistedTags = true;
            }
            component.set(permissions);
        } else {
            if (allowEditWhitelistedTags) {
                allowEditBasedOnTag(component);
            }
            allowEditBasedOnClass(component);
        }

        // apply edit restrictions to child components
        component.get('components').each(component => restrictEditAccess(component, allowEditWhitelistedTags));
    }

    function allowEditBasedOnTag(component) {
        let htmlTag = component.get('tagName');
        let editableTags = [
            //'div','span',
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
