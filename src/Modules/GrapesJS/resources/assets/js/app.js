import './pagebuilder';
import './block-search';
import './run-builder-scripts';
import './save-page';
import './manage-editable-components';
import './ai-content-editor';
import './ckeditor-hyperlinks';
import './responsive';

// Let users know the AI may need a little time for more involved requests.
(function () {
    var modalId = 'phpb-ai-content-modal';
    var noticeId = 'phpb-ai-content-wait-notice';

    function bindWaitNotice(modal) {
        if (!modal || modal.getAttribute('data-ai-wait-notice-bound') === 'true') {
            return !! modal;
        }

        var footer = modal.querySelector('#phpb-ai-content-footer');
        var spinner = modal.querySelector('#phpb-ai-content-generate-spinner');
        if (!footer || !spinner) {
            return false;
        }

        var notice = document.createElement('div');
        notice.id = noticeId;
        notice.className = 'small text-muted mr-auto d-none';
        notice.setAttribute('role', 'status');
        notice.setAttribute('aria-live', 'polite');
        notice.textContent = 'Afhankelijk van de complexiteit van je verzoek kan dit enkele seconden tot ruim 10 minuten duren. Haal gerust even koffie.';
        footer.insertBefore(notice, footer.firstChild);
        modal.setAttribute('data-ai-wait-notice-bound', 'true');

        function syncNotice() {
            if (spinner.classList.contains('d-none')) {
                notice.classList.add('d-none');
            } else {
                notice.classList.remove('d-none');
            }
        }

        syncNotice();
        new MutationObserver(syncNotice).observe(spinner, {
            attributes: true,
            attributeFilter: ['class']
        });

        return true;
    }

    function observeModal() {
        if (!document.body || !window.MutationObserver) {
            return;
        }

        var modal = document.getElementById(modalId);
        if (bindWaitNotice(modal)) {
            return;
        }

        var observer = new MutationObserver(function () {
            if (bindWaitNotice(document.getElementById(modalId))) {
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.body) {
        observeModal();
    } else {
        document.addEventListener('DOMContentLoaded', observeModal);
    }
})();
