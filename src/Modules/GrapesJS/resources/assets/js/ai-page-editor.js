(function() {
    let isBusy = false;

    function showMessage(message, type) {
        let element = $('#phpb-ai-content-message');
        element.removeClass('alert-success alert-danger alert-warning alert-info');
        element.addClass('alert-' + (type || 'info'));
        element.text(message || '');
        if (message) {
            element.removeClass('d-none').show();
        } else {
            element.addClass('d-none').hide();
        }
    }

    function setBusy(value) {
        isBusy = value;
        let button = $('#phpb-ai-content-generate');
        button.prop('disabled', value || ! $('#phpb-ai-content-prompt').val().trim());
        $('#phpb-ai-content-generate-spinner').toggleClass('d-none', ! value);
        $('#phpb-ai-content-modal .close').prop('disabled', value);

        if (window.setWaiting) {
            window.setWaiting(value);
        }
    }

    function pollGenerationJob(response, success, error) {
        let statusUrl = response && response.status_url;
        if (! statusUrl) {
            success(response);
            return;
        }

        let startedAt = Date.now();
        let poll = function() {
            $.ajax({
                type: 'GET',
                url: statusUrl,
                dataType: 'json'
            }).done(function(jobResponse) {
                if (jobResponse && jobResponse.status === 'success') {
                    success({
                        data: jobResponse.data,
                        debug: jobResponse.debug
                    });
                    return;
                }

                if (jobResponse && jobResponse.status === 'failed') {
                    error({responseJSON: jobResponse});
                    return;
                }

                if (Date.now() - startedAt >= 30 * 60 * 1000) {
                    error({responseJSON: {
                        message: 'De AI-taak duurt langer dan verwacht. Probeer het later opnieuw.'
                    }});
                    return;
                }

                window.setTimeout(poll, 1000);
            }).fail(error);
        };

        poll();
    }

    function finishWithError(xhr) {
        setBusy(false);
        let message = xhr && xhr.responseJSON && xhr.responseJSON.message
            ? xhr.responseJSON.message
            : 'De AI-wijziging is mislukt.';
        showMessage(message, 'danger');
    }

    function openEditor() {
        if (! window.aiPageBuilderGenerateUrl || isBusy) {
            return;
        }

        if (typeof window.openAiPageEditorModal !== 'function') {
            window.toastr.error('De AI-editor kon niet worden geopend.');
            return;
        }

        showMessage('', 'info');
        window.openAiPageEditorModal();
    }

    function applyResult(completedResponse, language) {
        let generated = completedResponse && completedResponse.data
            ? completedResponse.data
            : completedResponse;
        generated = generated || {};

        if (! Array.isArray(generated.blocks)) {
            finishWithError({responseJSON: {
                message: 'De AI gaf geen geldige pagina-aanpassing terug.'
            }});
            return;
        }

        let applied = window.applyAiPageHtmlBlocks(generated.blocks, language, function(success, message) {
            if (! success) {
                finishWithError({responseJSON: {
                    message: message || 'De pagina kon na de AI-wijziging niet opnieuw worden geladen.'
                }});
                return;
            }

            setBusy(false);
            $('#phpb-ai-content-modal').modal('hide');
            window.toastr.success('Wijzigingen zijn doorgevoerd');
        });

        if (! applied) {
            finishWithError({responseJSON: {
                message: 'De AI-wijziging past niet meer bij de huidige pagina. Probeer het opnieuw.'
            }});
            return;
        }
    }

    window.generateAiPageUpdate = function() {
        if (isBusy) {
            return;
        }

        let promptField = $('#phpb-ai-content-prompt');
        let prompt = promptField.val().trim();
        promptField.removeClass('is-invalid').removeAttr('aria-invalid');
        showMessage('', 'info');

        if (! prompt) {
            promptField.addClass('is-invalid').attr('aria-invalid', 'true').trigger('focus');
            return;
        }

        if (! window.prepareCurrentPageForAi) {
            showMessage('De huidige pagina kon niet worden voorbereid voor AI.', 'danger');
            return;
        }

        setBusy(true);
        window.prepareCurrentPageForAi(function(snapshot) {
            if (! snapshot || ! Array.isArray(snapshot.blocks) || snapshot.blocks.length === 0) {
                finishWithError({responseJSON: {
                    message: 'Deze pagina bevat geen bewerkbare HTML-blokken.'
                }});
                return;
            }

            $.ajax({
                type: 'POST',
                url: window.aiPageBuilderGenerateUrl,
                dataType: 'json',
                data: {
                    prompt: prompt,
                    language: snapshot.language,
                    html_blocks: snapshot.blocks
                }
            }).done(function(response) {
                pollGenerationJob(
                    response,
                    function(completedResponse) {
                        applyResult(completedResponse, snapshot.language);
                    },
                    finishWithError
                );
            }).fail(finishWithError);
        });
    };

    $(document).on('click', '#phpb-ai-page-action', openEditor);
    $(document).on('input', '#phpb-ai-content-modal[data-ai-scope="page"] #phpb-ai-content-prompt', function() {
        if (! isBusy) {
            let hasPrompt = !! $(this).val().trim();
            $('#phpb-ai-content-generate')
                .prop('disabled', ! hasPrompt)
                .toggleClass('btn-primary', hasPrompt)
                .toggleClass('btn-secondary', ! hasPrompt);
        }
    });

    $(document).ready(function() {
        if (window.aiPageBuilderEnabled === true && window.aiPageBuilderGenerateUrl) {
            $('#phpb-ai-page-action').css('display', 'inline-flex');
        }
    });
})();
