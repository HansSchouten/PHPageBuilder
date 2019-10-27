
<div id="gjs"></div>

<script type="text/javascript">
window.editor = grapesjs.init({
    container : '#gjs',
    noticeOnUnload: false,
    storageManager: {
        autoload: false,
        autosave: false
    },
    styleManager: {
        textNoElement: '<?= phpb_trans('pagebuilder.style-no-element-selected') ?>'
    },
    traitManager: {
        textNoElement: '<?= phpb_trans('pagebuilder.trait-no-element-selected') ?>'
    },
    panels: {
        defaults: [
            {
                id: 'views',
                buttons: [
                    {
                        id: 'open-blocks',
                        className: 'fa fa-th-large',
                        command: 'open-blocks',
                        togglable: 0,
                        attributes: {title: '<?= phpb_trans('pagebuilder.view-blocks') ?>'},
                        active: true,
                    },
                    {
                        id: 'open-tm',
                        className: 'fa fa-cog',
                        command: 'open-tm',
                        togglable: 0,
                        attributes: {title: '<?= phpb_trans('pagebuilder.view-settings') ?>'},
                    },
                    {
                        id: 'open-sm',
                        className: 'fa fa-paint-brush',
                        command: 'open-sm',
                        togglable: 0,
                        attributes: {title: '<?= phpb_trans('pagebuilder.view-style-manager') ?>'},
                    }
                ]
            },
        ]
    },
    canvas: {
        styles: [
            '<?= phpb_asset('pagebuilder/page-injection.css') ?>',
        ],
        scripts: [
            '<?= phpb_asset('pagebuilder/page-injection.js') ?>',
        ]
    }
});

editor.DomComponents.getWrapper().set('name', '<?= phpb_trans('pagebuilder.page') ?>');

editor.setComponents(<?= json_encode($pageRenderer->render()) ?>);

<?php
foreach ($blocks as $block):
?>
editor.BlockManager.add(<?= json_encode($block->getId()) ?>, <?= json_encode($block->getBlockManagerArray()) ?>);
<?php
endforeach;
?>
</script>

<div id="sidebar-bottom-buttons">
    <button id="save-page" class="btn">
        <i class="fa fa-floppy-o"></i>
        <?= phpb_trans('pagebuilder.save-page') ?>
    </button>
</div>
