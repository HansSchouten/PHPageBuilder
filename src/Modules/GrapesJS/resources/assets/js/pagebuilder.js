$(document).ready(function() {

    $(".gjs-editor").append($("#toggle-sidebar"));
    $(".gjs-pn-panels").prepend($("#sidebar-header"));
    $(".gjs-pn-panels").append($("#sidebar-bottom-buttons"));

    if ($(window).width() > 1000) {
        $(".gjs-cv-canvas").prepend($("#phpb-loading"));
    }

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
