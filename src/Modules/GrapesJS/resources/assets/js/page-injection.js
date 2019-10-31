$(document).ready(function() {

    $(document).bind("keydown", function(e){
        if(e.ctrlKey && e.which === 83) {
            e.preventDefault();
            return false;
        }
    });

});