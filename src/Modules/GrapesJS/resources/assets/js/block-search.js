
$(document).on("input", "#block-search input", function() {
    let term = $(this).val().toLowerCase();

    $(".gjs-blocks-cs .gjs-block").each(function() {
        let label = $(this).text().toLowerCase();
        if (label.includes(term)) {
            $(this).removeClass("d-none");
            $(this).find(".gjs-block-label").html(
                $(this).text().replace(term, '<b>' + term + '</b>')
            );
        } else {
            $(this).addClass("d-none");
        }
    });
});
