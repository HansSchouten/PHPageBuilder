$(document).ready(function() {

    $(".gjs-editor").append($("#toggle-sidebar"));
    $(".gjs-pn-panels").prepend($("#sidebar-header"));
    $(".gjs-pn-panels").append($("#sidebar-bottom-buttons"));

    $("#toggle-sidebar").click(function() {
        $("#gjs").toggleClass('sidebar-collapsed');
    });

    window.editor.on('run:open-sm', function(editor) {
        $("#gjs-sm-advanced .gjs-sm-properties").append($(".gjs-clm-tags"));
    });

    window.editor.on('block:drag:start', function(block) {
        if ($(window).width() < 1000) {
            $("#gjs").addClass('sidebar-collapsed');
        }
    });

});

// listen to messages from iframe
window.addEventListener("message", onMessage, false);

function onMessage(event) {
    // if the page is loaded, remove loading element
    if (event.data === 'page-loaded') {
        setTimeout(function() {
            $("#phpb-loading").addClass('loaded');
        }, 500);
    }
}
