$(document).ready(function() {

    $(".gjs-editor").append($("#toggle-sidebar"));
    $(".gjs-pn-panels").prepend($("#sidebar-header"));
    $(".gjs-pn-panels").append($("#sidebar-bottom-buttons"));

    $("#toggle-sidebar").click(function() {
        $("#gjs").toggleClass('sidebar-collapsed');
        triggerEditorResize();
    });

    window.editor.on('run:open-sm', function(editor) {
        $("#gjs-sm-advanced .gjs-sm-properties").append($(".gjs-clm-tags"));
    });

    window.editor.on('block:drag:start', function(block) {
        if ($(window).width() < 1000) {
            $("#gjs").addClass('sidebar-collapsed');
            triggerEditorResize();
        }
    });

    function triggerEditorResize() {
        window.editor.trigger('change:canvasOffset canvasScroll');
    }

    // prevent exiting page builder with backspace button
    let backspaceIsPressed = false;
    $(document).keydown(function(event) {
        if (event.which === 8) backspaceIsPressed = true;
    }).keyup(function(event) {
        if (event.which === 8) backspaceIsPressed = false;
    }).on('beforeunload', function(event) {
        if (backspaceIsPressed) event.preventDefault();
    });

});

function addBlockSearch() {
    $(".gjs-blocks-cs").prepend($("#block-search"));
}

// listen to messages from iframe
window.addEventListener("message", onMessage, false);

function onMessage(event) {
    // if the page is loaded, remove loading element
    if (event.data === 'page-loaded') {
        setTimeout(function() {
            $("#phpb-loading").addClass('loaded');
            addBlockSearch();
            window.isLoaded = true;
        }, 500);
    } else if(event.data === 'touch-start') {
        window.touchStart();
    }
}
