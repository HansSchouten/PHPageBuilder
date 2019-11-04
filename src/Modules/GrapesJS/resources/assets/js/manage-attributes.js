(function() {

    /**
     * On selecting a component, open the component settings panel.
     */
    window.editor.on('component:selected', function (component) {
        window.editor.Panels.getButton('views', 'open-settings').set('active', true);
    });

})();