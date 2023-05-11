<script type="text/javascript">

    editor.TraitManager.addType('image', {
        createInput({ trait }) {
            const previewImageUrl = '<?= phpb_asset('pagebuilder/images/image-placeholder-small.jpg') ?>';
            const traitName = trait.attributes.name;
            const el = document.createElement('div');
            el.innerHTML = `
<div class="image__preview-container">
    <img class="image__preview cursor-pointer" src="${previewImageUrl}">
    <button class="btn btn-light btn-sm image__remove-button d-none" type="button">
        <i class="fa fa-close"></i>
    </button>
</div>
        `;
            const preview = el.querySelector('.image__preview');
            const removeButton = el.querySelector('.image__remove-button');

            const component = window.editor.getSelected();
            if (component.attributes.attributes[traitName] !== undefined && component.attributes.attributes[traitName] !== '') {
                preview.setAttribute('src', component.attributes.attributes[traitName]);
                removeButton.classList.remove('d-none');
            }

            preview.addEventListener('click', event => {
                window.editor.runCommand('open-assets', {
                    onSelect: asset => {
                        preview.setAttribute('src', asset.attributes.src);
                        removeButton.classList.remove('d-none');
                        // update component setting and trigger editor component:update event
                        component.addAttributes({[traitName]: asset.attributes.src});
                    }
                });
            });

            removeButton.addEventListener('click', event => {
                removeButton.classList.add('d-none');
                preview.setAttribute('src', previewImageUrl);
                component.addAttributes({[traitName]: ''});
            });

            return el;
        }
    });

</script>
