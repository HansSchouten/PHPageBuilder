(function() {

    window.customBuilderScripts = {};

    /**
     * On instantiating a block component, before it is mounted in the canvas.
     * Keep its builder script out of the component tree; scripts can belong to
     * either editable page content or a reusable layout.
     */
    window.editor.on('component:create', component => {
        // extract the script tag of the given component (if it has one)
        if (component.components().length) {
            let lastChild = component.components().models[component.components().length - 1];
            if (lastChild.attributes.type === 'script') {
                let blockId = getBlockId(component);
                if (blockId !== undefined && blockId !== null && blockId !== '') {
                    window.customBuilderScripts[blockId] = lastChild.toHTML();
                    lastChild.remove();
                }
            }
        }
    });

    /**
     * After mounting the component in the canvas.
     */
    window.editor.on('component:add', function (component) {
        // run the script that was set when creating this component
        if (component.attributes['run-builder-script'] !== undefined) {
            let originalCustomBuilderScripts = customBuilderScripts;

            window.customBuilderScripts[component.attributes['block-id']] = customBuilderScripts[component.attributes['run-builder-script']];
            window.runScriptsOfComponentAndChildren(component);

            window.customBuilderScripts = originalCustomBuilderScripts;
            delete component.attributes['run-builder-script'];
        }
    });

    /**
     * On ending a component order drag, re-run builder scripts on newly added HTMl.
     */
    window.editor.on('sorter:drag:end', function(event) {
        let component = event.modelToDrop;
        if (component && component.attributes && (component.attributes['block-id'] || component.attributes['id'])) {
            window.runScriptsOfComponentAndChildren(component);
        }
        // remove all existing CKEditors after dragging a block with active editor
        for (let instanceName in CKEDITOR.instances) {
            CKEDITOR.instances[instanceName].destroy(true);
        }
    });

    /**
     * Run the custom builder scripts of the given component and of all child components.
     *
     * @param component
     */
    window.runScriptsOfComponentAndChildren = function(component, skipContentContainers = false) {
        let componentAttributes = component.attributes || {};
        let htmlAttributes = componentAttributes.attributes || {};
        if (skipContentContainers && htmlAttributes['phpb-content-container'] !== undefined) {
            return;
        }

        runComponentScript(component, skipContentContainers);
        component.components().each(function(child) {
            window.runScriptsOfComponentAndChildren(child, skipContentContainers);
        });
    }

    /**
     * Run the custom builder scripts of the given component.
     *
     * @param component
     */
    function getBlockId(component) {
        let componentAttributes = component.attributes || {};
        let htmlAttributes = componentAttributes.attributes || {};
        let blockId = componentAttributes['block-id'];
        if (blockId === undefined) {
            blockId = htmlAttributes['block-id'];
        }
        if (blockId === undefined) {
            blockId = htmlAttributes['id'];
        }
        return blockId;
    }

    let layoutScriptStyleIdentifier = 0;

    function runComponentScript(component, isLayoutComponent = false) {
        let blockId = getBlockId(component);
        if (blockId && window.customBuilderScripts[blockId] !== undefined) {
            let componentAttributes = component.attributes || {};
            let htmlAttributes = componentAttributes.attributes || {};
            let styleIdentifier = componentAttributes["style-identifier"] || htmlAttributes["style-identifier"];

            if (isLayoutComponent) {
                let element = component.getEl();
                if (!element) return;

                styleIdentifier = styleIdentifier || element.getAttribute('data-phpb-layout-script-class');
                if (!styleIdentifier) {
                    styleIdentifier = 'phpb-layout-script-preview-' + Date.now().toString(36) + '-' + (++layoutScriptStyleIdentifier);
                    element.setAttribute('data-phpb-layout-script-class', styleIdentifier);
                }
                element.classList.add(styleIdentifier);
            }

            let $scriptTag = $("<container>").append(window.customBuilderScripts[blockId]);
            // prepend block and blockSelector variables allowing the script to refer to this exact block instance
            $scriptTag.find('script').prepend('let inPageBuilder = true;');
            $scriptTag.find('script').prepend('let blockSelector = ".' + styleIdentifier + '";');
            $scriptTag.find('script').prepend('let block = document.getElementsByClassName("' + styleIdentifier + '")[0];');
            // wrap the script contents in a self-invoking function (to add a scope avoiding variable name collisions)
            $scriptTag.find('script').prepend('(function(){');
            $scriptTag.find('script').append('})();');

            // execute the script in the page that is being edited
            let scriptTag = document.createElement("script");
            scriptTag.type = "text/javascript";
            scriptTag.innerHTML = $scriptTag.find('script').html();
            window.editor.Canvas.getDocument().body.appendChild(scriptTag);
        }
    }

})();
