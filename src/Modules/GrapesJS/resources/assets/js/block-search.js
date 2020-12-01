
$(document).on("input", "#block-search input", function() {
    let term = $(this).val().toLowerCase();

    $(".gjs-block-category").each(function() {
        let atLeastOneMatch = false;

        $(this).find(".gjs-block").each(function() {
            let label = $(this).text().toLowerCase();
            if (label.includes(term)) {
                $(this).removeClass("d-none");
                atLeastOneMatch = true;

                let regEx = new RegExp('(' + term + ')', "gi");
                $(this).find(".gjs-block-label").html(
                    $(this).text().replace(regEx, '<b>$1</b>')
                );
            } else {
                $(this).addClass("d-none");
            }
        });

        $(this).removeClass("d-none");
        if (! atLeastOneMatch) {
            $(this).addClass("d-none");
        }
    });
});
