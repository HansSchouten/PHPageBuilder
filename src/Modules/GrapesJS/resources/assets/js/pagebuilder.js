window.onload = function() {

    window.editor.on('block:drag:stop', droppedComponent => {
        if (! droppedComponent) {
            return;
        }
        updateComponentAccess(droppedComponent);
        droppedComponent.set({
            removable: true,
            draggable: true,
            copyable: true,
            selectable: true,
            hoverable: true,
        })
    });

    const updateComponentAccess = (component) => {
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
        if ('gjs-editable' in component.attributes.attributes) {
            component.set({
                hoverable: true,
                selectable: true,
                editable: true,
            })
        }
        component.get('components').each(c => updateComponentAccess(c));
    };

};
