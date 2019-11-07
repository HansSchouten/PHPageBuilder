$(document).ready(function() {

    /* disable ctrl + s, since this is handled in iframe parent */
    $(document).bind("keydown", function(e){
        if(e.ctrlKey && e.which === 83) {
            e.preventDefault();
            return false;
        }
    });

    /* post message to iframe parent that page has been loaded */
    window.parent.postMessage("page-loaded", '*');

    $(document).on('touchstart', function(e) {
        window.parent.postMessage("touch-start", '*');
    });

});