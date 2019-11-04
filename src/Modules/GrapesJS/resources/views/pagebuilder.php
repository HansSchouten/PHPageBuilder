
<div id="gjs"></div>

<script type="text/javascript">
window.translations = <?= json_encode(phpb_trans('pagebuilder')) ?>;
window.pageComponents = <?= $pageRenderer->getPageComponents() ?>;
window.dynamicBlocks = <?= $pageRenderer->getDynamicBlocks() ?>;

window.editor = grapesjs.init({
    container : '#gjs',
    noticeOnUnload: false,
    avoidInlineStyle: false,
    storageManager: {
        type: 'remote',
        autoload: false,
        autosave: false,
        urlStore: '<?= phpb_route('?route=pagebuilder&action=store&page=' . $page->id) ?>',
    },
    styleManager: {
        textNoElement: '<?= phpb_trans('pagebuilder.style-no-element-selected') ?>'
    },
    traitManager: {
        textNoElement: '<?= phpb_trans('pagebuilder.trait-no-element-selected') ?>',
        labelContainer: '<?= phpb_trans('pagebuilder.trait-settings') ?>',
        labelPlhText: '',
        labelPlhHref: 'https://website.com',
        optionsTarget: [
            { value: '', name: '<?= phpb_trans('pagebuilder.trait-this-window') ?>' },
            { value: '_blank', name: '<?= phpb_trans('pagebuilder.trait-new-window') ?>' }
        ]
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
                        id: 'open-settings',
                        className: 'fa fa-cog',
                        command: 'open-tm',
                        togglable: 0,
                        attributes: {title: '<?= phpb_trans('pagebuilder.view-settings') ?>'},
                    },
                    {
                        id: 'open-style',
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
            'https://code.jquery.com/jquery-3.4.1.slim.min.js',
            '<?= phpb_asset('pagebuilder/page-injection.js') ?>',
        ]
    }
});

// set custom name for the wrapper component containing all page components
editor.DomComponents.getWrapper().set('custom-name', '<?= phpb_trans('pagebuilder.page') ?>');

// set the non-editable page layout components and the phpb-content-container in which all editable components will be loaded
editor.setComponents(<?= json_encode($pageRenderer->render()) ?>);

// load the earlier saved page css components
editor.setStyle(<?= $pageRenderer->getPageStyleComponents() ?>);

<?php
foreach ($blocks as $block):
?>
editor.BlockManager.add(<?= json_encode($block->getSlug()) ?>, <?= json_encode($block->getBlockManagerArray()) ?>);
<?php
endforeach;
?>
</script>

<div id="sidebar-bottom-buttons">
    <button id="save-page" class="btn" data-url="<?= phpb_route('?route=pagebuilder&action=store&page=' . $page->id) ?>">
        <span class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
        <i class="fa fa-floppy-o"></i>
        <?= phpb_trans('pagebuilder.save-page') ?>
    </button>

    <a id="view-page" href="<?= e($page->route) ?>" target="_blank" class="btn">
        <i class="fa fa-external-link"></i>
        <?= phpb_trans('pagebuilder.view-page') ?>
    </a>

    <a id="go-back" href="<?= phpb_route('') ?>" class="btn">
        <i class="fa fa-arrow-circle-o-left"></i>
        <?= phpb_trans('pagebuilder.go-back') ?>
    </a>
</div>
