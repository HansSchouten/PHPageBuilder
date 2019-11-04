$(document).ready(function() {

    $(".gjs-pn-panels").append($("#sidebar-bottom-buttons"));

    window.editor.on('run:open-sm', function(editor) {
        $("#gjs-sm-advanced .gjs-sm-properties").append($(".gjs-clm-tags"));
    });

});
