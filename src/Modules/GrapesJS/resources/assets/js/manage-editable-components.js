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

    function applyBlockAttributesToComponents(component) {
        if (component.attributes.tagName === 'phpb-block') {
            // Component is a <phpb-block> element needed to carry information to the components of the parent block,
            // replace the <phpb-block> component with its children while giving its children the attributes of the <phpb-block> component.
            let container = component.parent();
            let clone = component.clone();

            let blockRootComponents = [];
            let newContainerChilds = [];
            // Since component is a <phpb-block>, the parent of component needs to get an updated array of children
            // in which <phpb-block> is replaced by its child(ren). The direct children of the <phpb-block> component
            // will be the new block root components.
            container.components().each(function(blockSibling) {
                if (blockSibling.cid === component.cid) {
                    if (component.attributes.attributes['is-html'] === 'true' || clone.components().length === 1) {
                        clone.components().each(function(originalComponentChild) {
                            let blockRootComponent = originalComponentChild.clone();
                            newContainerChilds.push(blockRootComponent);
                            blockRootComponents.push(blockRootComponent);
                        });
                    } else {
                        // a non-html block should be (re)moved & copied in one piece, so we need to add a container div
                        //let dynamicBlockContainer =
                        clone.components().each(function(originalComponentChild) {
                            let blockRootComponent = originalComponentChild.clone();
                            newContainerChilds.push(blockRootComponent);
                            blockRootComponents.push(blockRootComponent);
                        });
                    }
                } else {
                    newContainerChilds.push(blockSibling);
                }
            });
            container.components(newContainerChilds);
            component.remove();

            blockRootComponents.forEach(function(blockRootComponent) {
                applyBlockAttributes(clone, blockRootComponent);

                // recursive call to find and replace <phpb-block> elements of nested blocks (loaded via shortcodes)
                applyBlockAttributesToComponents(blockRootComponent);
            });
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
            component.set({
                removable: true,
                draggable: true,
                copyable: true,
                layerable: true,
                selectable: true,
                hoverable: true,
            });

            if (component.attributes['is-html'] === 'true') {
                allowEditWhitelistedTags = true;
            }
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
