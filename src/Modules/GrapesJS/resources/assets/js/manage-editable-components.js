(function() {

    /**
     * After loading the initial content of the page builder, restrict access to all layout components.
     * Only blocks and components inside the element with phpb-content-container attribute are editable.
     */
    window.editor.on('load', function(editor) {
        denyAccessToLayoutElements(editor.getWrapper());
        addThemeBlocks();

        let container = editor.getWrapper().find("[phpb-content-container]")[0];
        container.set('custom-name', window.translations['page-content']);

        // add all previously stored page components to the page builder
        container.components(window.pageComponents);

        // replace phpb-block elements with the server-side rendered version of each dynamic block.
        replacePlaceholdersForRenderedBlocks(container);

        // apply dynamic block attributes to the server-side rendered html
        applyBlockAttributesToComponents(container);

        // only allow to edit html blocks
        // (apply after delay, since some styles are not immediately applied and accessible via getComputedStyle)
        setTimeout(function() {
            restrictEditAccess(container);
        }, 500);
    });

    /**
     * Add all theme blocks to GrapesJS blocks manager.
     */
    function addThemeBlocks() {
        for (let blockSlug in window.themeBlocks) {
            let block = window.themeBlocks[blockSlug];

            // remove whitespace from phpb-block-container elements, otherwise these components will become type=text,
            // resulting in components dropped inside the container jumping to the dropped position - 1
            let $blockHtml = $("<container>").append(block.content);
            $blockHtml.find("[phpb-blocks-container]").each(function() {
                if ($(this).html() !== '' && $(this).html().trim() === '') {
                    $(this).html('');
                }
            });
            block.content = $blockHtml.html();

            editor.BlockManager.add(blockSlug, block);
        }
    }

    /**
     * Replace phpb-block elements with the server-side rendered version of each dynamic block.
     *
     * @param component
     */
    function replacePlaceholdersForRenderedBlocks(component) {
        let newComponent = component;

        // if we encounter a dynamic block, replace it with the server-side rendered html
        if (component.get('tagName') === 'phpb-block') {
            let id = component.attributes.attributes.id;
            if (window.dynamicBlocks[id] !== undefined && window.dynamicBlocks[id]['html'] !== undefined) {
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
     * Component select handler.
     */
    window.editor.on('component:selected', function(component) {
        // only show the copy/drag/remove toolbar if the component is draggable or removable
        document.querySelector('.gjs-toolbar').classList.add('d-none');
        if (component.attributes.draggable
            || component.attributes.removable
            || "phpb-blocks-container" in component.attributes.attributes) {
            document.querySelector('.gjs-toolbar').classList.remove('d-none');
        }

        // if the component has settings, activate settings panel in pagebuilder sidebar
        if (window.blockSettings[component.attributes['block-slug']] !== undefined &&
            window.blockSettings[component.attributes['block-slug']].length) {
            $(".gjs-pn-buttons .gjs-pn-btn:nth-of-type(2)").click();
        }
        else if (componentHasBackground(component)) {
            // on selecting a component without settings, with editable background, show background styling
            $(".gjs-pn-buttons .gjs-pn-btn:nth-of-type(3)").click();
            if ($("#gjs-sm-position").hasClass("gjs-sm-open")) {
                $("#gjs-sm-position").find(".gjs-sm-title").click();
            }
            if (! $("#gjs-sm-background").hasClass("gjs-sm-open")) {
                $("#gjs-sm-background").find(".gjs-sm-title").click();
            }
        }
    });

    /**
     * Return whether the given component contains a CSS background, that should be editable.
     *
     * @param component
     * @returns {boolean}
     */
    function componentHasBackground(component) {
        let hasBackground = false;

        let componentElement = component.getEl();
        if (componentElement && componentElement.style) {
            let componentStyle = window.getComputedStyle(componentElement);

            ['background', 'background-image', 'background-color'].forEach(property => {
                let value = componentStyle.getPropertyValue(property);
                if (value !== undefined && value !== '' && ! value.includes('none') && ! value.includes('rgba(0, 0, 0, 0)')) {
                    hasBackground = true;
                }
            });
        }

        return hasBackground;
    }

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
     * Apply the block attributes which are stored in <phpb-block> elements to the top-level html element inside the block.
     * If the block starts with multiple top-level html elements, add a div element wrapping the block's top-level elements.
     *
     * @param component
     */
    function applyBlockAttributesToComponents(component) {
        if (component.attributes.tagName === 'phpb-block') {
            let container = component.parent();
            let clone = cloneComponent(component);

            // Since component is a <phpb-block> that should be removed and replaced by its children,
            // the component's parent's child that has the same id as component needs to be replaced.
            let blockRootComponent;
            container.components().each(function(componentSibling) {
                if (componentSibling.cid === component.cid) {
                    // replace the <phpb-block> with the actual component
                    // the component is wrapped with a div to allow styling dynamic blocks (with only the .style-identifier in the css selector)
                    blockRootComponent = component.replaceWith({tagName: 'div'});
                    clone.components().each(function(componentChild) {
                        blockRootComponent.append(cloneComponent(componentChild));
                    });
                }
            });
            component.remove();

            copyAttributes(clone, blockRootComponent, true, false);
            // add all settings of this component to the settings panel in the sidebar
            addSettings(blockRootComponent);
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
     * Add all settings from the block's config file to the given component,
     * to allow them to be changed in the settings side panel.
     *
     * @param component
     */
    function addSettings(component) {
        if (window.blockSettings[component.attributes['block-slug']] === undefined) {
            return;
        }
        component.attributes.settings = {};
        // get the stored settings of the given component (from saving the pagebuilder earlier)
        let settingValues = [];
        let blockId = component.attributes['block-id'];
        if (window.dynamicBlocks[blockId] !== undefined && window.dynamicBlocks[blockId].settings.attributes !== undefined) {
            component.attributes.settings = window.dynamicBlocks[blockId].settings;
            settingValues = window.dynamicBlocks[blockId].settings.attributes;
        } else if (component.parent() && component.parent().attributes['settings'] !== undefined) {
            // the settings of this component are not stored globally in window.dynamicBlocks,
            // so try to retrieve this component's settings from the parent block (which is necessary for nested dynamic blocks)
            let parentSettings = component.parent().attributes['settings'];
            if (parentSettings[blockId] !== undefined && parentSettings[blockId].attributes !== undefined) {
                component.attributes.settings = parentSettings[blockId];
                settingValues = parentSettings[blockId].attributes;
            }
        }
        // set style identifier class to the dynamic block wrapper, if an identifier is stored in the block settings from saving the pagebuilder earlier
        if (settingValues['style-identifier'] !== undefined) {
            component.addClass(settingValues['style-identifier']);
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
        if ($(".gjs-frame").contents().find("#" + component.ccid).length === 0) {
            return;
        }

        // dynamic blocks can depend on data passed by dynamic parent blocks, so we need to update the closest parent which does not have a dynamic parent itself
        let componentToUpdate = component;
        while (componentToUpdate.parent() && componentToUpdate.parent().attributes['is-html'] === 'false') {
            componentToUpdate = componentToUpdate.parent();
        }
        component = componentToUpdate;

        component.attributes['is-updating'] = true;
        $(".gjs-frame").contents().find("#" + component.ccid).addClass('gjs-freezed');

        let container = window.editor.getWrapper().find("#" + component.ccid)[0].parent();
        let data = window.getComponentDataInStorageFormat(component);

        // refresh component contents with updated version requested via ajax call
        $.ajax({
            type: "POST",
            url: window.renderBlockUrl,
            data: {
                data: JSON.stringify(data)
            },
            success: function(blockHtml) {
                let blockId = $(blockHtml).attr('block-id');

                // set dynamic block settings for the updated component to the new values
                if (window.dynamicBlocks[blockId] === undefined) {
                    window.dynamicBlocks[blockId] = {settings: {}};
                }
                window.dynamicBlocks[blockId].settings = (data.blocks[blockId] === undefined) ? {} : data.blocks[blockId];

                // replace old component for the rendered html returned by the server
                component.replaceWith(blockHtml);
                replacePlaceholdersForRenderedBlocks(container);
                applyBlockAttributesToComponents(container);
                restrictEditAccess(container);

                // select the component that was selected before the ajax call
                let newComponent;
                container.components().each(function(containerChild) {
                    if (containerChild.attributes['block-id'] === blockId) {
                        newComponent = containerChild;
                    }
                });
                window.editor.select(newComponent);
            },
            error: function() {
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
            // we just entered a new block, set permissions
            let permissions = {
                selectable: true,
                hoverable: true,
            };
            if (! directlyInsideDynamicBlock) {
                // the block we entered is not located directly inside a dynamic block, hence this block can be modified
                permissions = {
                    removable: true,
                    draggable: true,
                    copyable: true,
                    selectable: true,
                    hoverable: true,
                    stylable: true,
                };
                // for styling this particular block, the block needs to have a unique class
                addUniqueClass(component);
            }
            if (component.attributes['is-html'] === 'true') {
                // the block we just entered is an html block,
                // the next layer of child blocks are not directly inside a dynamic block
                directlyInsideDynamicBlock = false;
                // in an html block, editing elements (based on their html tag) is allowed
                allowEditWhitelistedTags = true;
            } else {
                // the block we just entered is dynamic,
                // the next layer of child blocks are directly inside a dynamic block
                directlyInsideDynamicBlock = true;
                // in a dynamic block, editing elements (based on their html tag) is not allowed
                allowEditWhitelistedTags = false;
                // dynamic blocks do not have text cursors
                component.getEl().setAttribute('data-cursor', 'default');
            }
            component.set(permissions);
        }

        // set editable access based on tags, styling or html class attribute
        if (allowEditWhitelistedTags) {
            allowEditBasedOnTagAndStyling(component);
        }
        allowEditBasedOnAttribute(component);

        // apply edit restrictions to child components
        component.get('components').each(component => restrictEditAccess(component, directlyInsideDynamicBlock, allowEditWhitelistedTags));
    }

    /**
     * Set the given component's editability based on which tag the component represents
     * or which theme styling is assigned.
     *
     * @param component
     */
    function allowEditBasedOnTagAndStyling(component) {
        let htmlTag = component.get('tagName');
        let editableTags = [
            //'div','span',   // needed for editable bootstrap alert, but cannot be used since divs (block containers) then cannot be removed
            'h1','h2','h3','h4','h5','h6','h7',
            'p','a','img','button','small','b','strong','i','em',
            'ul','li','th','td'
        ];

        if (editableTags.includes(htmlTag) || componentHasBackground(component)) {
            makeComponentEditable(component);
        }
    }

    /**
     * Set the given component's editability based on its html attributes.
     *
     * @param component
     */
    function allowEditBasedOnAttribute(component) {
        if ('phpb-editable' in component.attributes.attributes
            || 'phpb-blocks-container' in component.attributes.attributes) {
            makeComponentEditable(component);
        }
    }

    /**
     * Make the given component editable.
     *
     * @param component
     */
    function makeComponentEditable(component) {
        let settings = {
            hoverable: true,
            selectable: true,
            editable: true,
            stylable: true,
        };
        if ('phpb-blocks-container' in component.attributes.attributes) {
            settings.droppable = true;
        }
        component.set(settings);
        addUniqueClass(component);
    }

    /**
     * Add a unique class to this component to ensure style only applies to this component instance.
     *
     * @param component
     */
    function addUniqueClass(component) {
        // get component identifier class if one is already to the component's html when saving the pagebuilder previously
        let componentIdentifier = false;
        component.getClasses().forEach(componentClass => {
            if (componentClass.startsWith('ID') && componentClass.length === 16) {
                componentIdentifier = componentClass;
            }
        });

        if (component.attributes['style-identifier'] === undefined) {
            component.attributes['style-identifier'] = componentIdentifier ? componentIdentifier : generateId();
        }
        if (! componentIdentifier) {
            component.addClass(component.attributes['style-identifier']);
        }
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
