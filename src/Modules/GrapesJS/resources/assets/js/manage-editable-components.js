(function() {

    /**
     * After loading the initial content of the page builder, restrict access to all layout components.
     * Only blocks and components inside the element with phpb-content-container attribute are editable.
     */
    window.editor.on('load', function(editor) {
        denyAccessToLayoutElements(editor.getWrapper());

        let container = editor.getWrapper().find("[phpb-content-container]")[0];
        container.set('custom-name', window.translations['page-content']);

        // add all previously stored page components inside the content container
        container.components(window.pageComponents);

        replacePlaceholdersForRenderedBlocks(container);
        applyBlockAttributesToComponents(container);

        restrictEditAccess(container);
    });

    /**
     * Replace phpb-blocks elements with the server-side rendered version of each dynamic block.
     *
     * @param component
     */
    function replacePlaceholdersForRenderedBlocks(component) {
        let newComponent = component;

        if (component.get('tagName') === 'phpb-block') {
            let id = component.attributes.attributes.id;
            if (window.dynamicBlocks[id] !== undefined) {
                newComponent = component.replaceWith(window.dynamicBlocks[id]['html']);
            }
        }

        // replace placeholders inside child components
        newComponent.get('components').each(childComponent => replacePlaceholdersForRenderedBlocks(childComponent));
    }

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

    /**
     * On dropping a component on the canvas, apply attributes of the container phpb-block element with configuration passed
     * from the server and restrict edit access to editable components.
     */
    window.editor.on('block:drag:stop', function(droppedComponent) {
        // ensure component drop was successful
        if (! droppedComponent) return;

        let parent = droppedComponent.parent();
        applyBlockAttributesToComponents(droppedComponent);
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
            let clone = cloneComponent(component);

            // Since component is a <phpb-block> that should be removed and replaced by its children,
            // the component's parent child that has the same id as component needs to be replaced.
            let blockRootComponent;
            container.components().each(function(componentSibling) {
                if (componentSibling.cid === component.cid) {
                    if (component.components().length === 1) {
                        blockRootComponent = cloneComponent(component.components().models[0]);
                        component.replaceWith(blockRootComponent);
                    } else {
                        // if the phpb-block has multiple direct children, add a wrapper first
                        blockRootComponent = component.replaceWith({tagName: 'div'});
                        clone.components().each(function(componentChild) {
                            blockRootComponent.append(cloneComponent(componentChild));
                        });
                    }
                }
            });
            component.remove();

            copyAttributes(clone, blockRootComponent, true, false);
            // recursive call to find and replace <phpb-block> elements of nested blocks (loaded via shortcodes)
            applyBlockAttributesToComponents(blockRootComponent);
            // add all settings of this component type to the settings panel in the sidebar
            addSettings(blockRootComponent);
        } else {
            component.components().each(function(childComponent) {
                // recursive call to find and replace <phpb-block> elements of nested blocks (loaded via shortcodes)
                applyBlockAttributesToComponents(childComponent);
            });
        }
    }

    /**
     * Add all settings from the block's config file to the given component, to allow them being changed in
     * the settings side panel.
     *
     * @param component
     */
    function addSettings(component) {
        if (window.blockSettings[component.attributes['block-slug']] === undefined) {
            return;
        }
        // get the values stored for each setting
        let settingValues = [];
        let blockId = component.attributes['block-id'];
        if (window.dynamicBlocks[blockId] !== undefined && window.dynamicBlocks[blockId].settings.attributes !== undefined) {
            settingValues = window.dynamicBlocks[blockId].settings.attributes;
        }
        // for each setting add a trait to the settings sidebar panel with the earlier stored or default value
        component.attributes['is-updating'] = true;
        let settings = window.blockSettings[component.attributes['block-slug']];
        settings.forEach(function(setting) {
            let trait = component.addTrait(setting);
            if (settingValues[setting['name']] !== undefined) {
                trait.setTargetValue(settingValues[setting['name']]);
            } else if (setting['default-value'] !== undefined) {
                trait.setTargetValue(setting['default-value']);
            }
        });
        component.attributes['is-updating'] = false;
    }

    /**
     * On updating an attribute (block setting from the settings side panel), refresh dynamic block via Ajax.
     */
    window.editor.on('component:update', function(component) {
        if (window.isLoaded !== true || component.attributes['is-updating'] || component.changed['attributes'] === undefined) {
            return;
        }

        component.attributes['is-updating'] = true;
        $(".gjs-frame").contents().find("#" + component.ccid).addClass('gjs-freezed');

        let container = window.editor.getWrapper().find("#" + component.ccid)[0].parent();
        let data = window.getDataInStorageFormat(container);

        // refresh component contents with updated version requested via ajax call
        $.ajax({
            type: "POST",
            url: window.renderBlockUrl,
            data: {
                data: JSON.stringify(data)
            },
            success: function(data) {
                $(".gjs-frame").contents().find("#" + component.ccid).removeClass('gjs-freezed');
                component.replaceWith(data);

                replacePlaceholdersForRenderedBlocks(container);
                applyBlockAttributesToComponents(container);
                restrictEditAccess(container);

                component.attributes['is-updating'] = false;
            },
            error: function () {
                $(".gjs-frame").contents().find("#" + component.ccid).removeClass('gjs-freezed');
                component.attributes['is-updating'] = false;
            }
        });
    });

    /**
     * Clone the given component (while preserving all attributes, like IDs).
     *
     * @param component
     */
    window.cloneComponent = function(component) {
        let clone = component.clone();
        deepCopyAttributes(component, clone);
        return clone;
    };

    /**
     * Apply the attributes of the given component and its children to each corresponding component of the given clone.
     *
     * @param component
     * @param clone
     */
    function deepCopyAttributes(component, clone) {
        // apply all attributes from component to clone
        copyAttributes(component, clone, false, true);
        // apply attributes from component's children to clone's children
        for (let index = 0; index < component.components().length; index++) {
            let componentChild = component.components().models[index];
            let cloneChild = clone.components().models[index];
            deepCopyAttributes(componentChild, cloneChild);
        }
    }

    /**
     * Apply the attributes of the given component to the given target component.
     *
     * @param component
     * @param targetComponent
     * @param copyGrapesAttributes              whether all GrapesJS component attributes (like permissions) should be copied
     * @param copyHtmlElementAttributes         whether the html element attributes should be copied
     */
    function copyAttributes(component, targetComponent, copyGrapesAttributes, copyHtmlElementAttributes) {
        let componentAttributes = component.attributes.attributes;
        for (var attribute in componentAttributes) {
            if (componentAttributes.hasOwnProperty(attribute)) {
                if (copyHtmlElementAttributes) {
                    targetComponent.attributes.attributes[attribute] = componentAttributes[attribute];
                }
                if (copyGrapesAttributes) {
                    targetComponent.attributes[attribute] = componentAttributes[attribute];
                }
            }
        }
    }

    /**
     * Function for only allowing edit access on whitelisted components.
     *
     * @param component
     * @param directlyInsideDynamicBlock
     * @param allowEditWhitelistedTags
     */
    function restrictEditAccess(component, directlyInsideDynamicBlock = false, allowEditWhitelistedTags = false) {
        disableAllEditFunctionality(component);

        if (component.attributes.attributes['phpb-content-container'] !== undefined) {
            // we are in the content container of the current page, this component can receive other components
            component.set({
                droppable: true,
                hoverable: true,
            });
        } else if (component.attributes['block-slug'] !== undefined) {
            // by default a block has the following permissions
            let permissions = {
                removable: true,
                draggable: true,
                copyable: true,
                selectable: true,
                hoverable: true,
                stylable: true,
            };
            addUniqueClass(component);
            if (component.attributes['is-html'] === 'false') {
                // we are inside a dynamic block, the first layer of child blocks are directly inside a dynamic block
                directlyInsideDynamicBlock = true;
            } else {
                if (directlyInsideDynamicBlock) {
                    // we are inside a html block directly inside a dynamic block, these html blocks are not removable/copyable/draggable
                    permissions.removable = false;
                    permissions.copyable = false;
                    permissions.draggable = false;
                    directlyInsideDynamicBlock = false;
                }
                allowEditWhitelistedTags = true;
            }
            component.set(permissions);
        }

        // set editable access based on tags or html class attribute
        if (allowEditWhitelistedTags) {
            allowEditBasedOnTag(component);
        }
        allowEditBasedOnClass(component);

        // apply edit restrictions to child components
        component.get('components').each(component => restrictEditAccess(component, directlyInsideDynamicBlock, allowEditWhitelistedTags));
    }

    /**
     * Set the given component's editability based on which tag the component represents.
     *
     * @param component
     */
    function allowEditBasedOnTag(component) {
        let htmlTag = component.get('tagName');
        let editableTags = [
            //'div','span',   // needed for editable bootstrap alert, but cannot be used since divs (block containers) then cannot be removed
            'h1','h2','h3','h4','h5','h6','h7',
            'p','a','img','button','small','b','strong','i','em',
            'ul','li','th','td'
        ];

        if (editableTags.includes(htmlTag)) {
            makeComponentEditable(component);
        }
    }

    /**
     * Set the given component's editability based on its html class attribute.
     *
     * @param component
     */
    function allowEditBasedOnClass(component) {
        if ('phpb-editable' in component.attributes.attributes) {
            makeComponentEditable(component);
        }
    }

    /**
     * Make the given component editable.
     *
     * @param component
     */
    function makeComponentEditable(component) {
        component.set({
            hoverable: true,
            selectable: true,
            editable: true,
            stylable: true,
        });
        addUniqueClass(component);
    }

    /**
     * Add a unique class to this component to ensure style only applies to this component instance.
     *
     * @param component
     */
    function addUniqueClass(component) {
        if (component.attributes['style-identifier'] === undefined) {
            component.attributes['style-identifier'] = generateId();
        }
        component.addClass(component.attributes['style-identifier']);
    }

    /**
     * Disable all edit functionality on the given component.
     *
     * @param component
     */
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

    /**
     * Generate a unique id string.
     *
     * Based on: https://gist.github.com/gordonbrander/2230317
     */
    let counter = 0;
    function generateId() {
        return 'ID' + (Date.now().toString(36)
            + Math.random().toString(36).substr(2, 5) + counter++).toUpperCase();
    }

})();
