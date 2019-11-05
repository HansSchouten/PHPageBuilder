<div id="phpb-loading">
    <div class="circle">
        <div class="loader">
            <div class="loader">
                <div class="loader">
                    <div class="loader"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<div id="gjs"></div>

<script type="text/javascript" src="https://cdn.ckeditor.com/4.11.4/full-all/ckeditor.js"></script>
<script type="text/javascript" src="<?= phpb_asset('pagebuilder/grapesjs-plugin-ckeditor-v0.0.9.min.js') ?>"></script>
<script type="text/javascript" src="<?= phpb_asset('pagebuilder/grapesjs-touch-v0.1.1.min.js') ?>"></script>
<script type="text/javascript">
CKEDITOR.dtd.$editable.a = 1;
CKEDITOR.dtd.$editable.b = 1;
CKEDITOR.dtd.$editable.em = 1;
CKEDITOR.dtd.$editable.button = 1;
CKEDITOR.dtd.$editable.strong = 1;

window.translations = <?= json_encode(phpb_trans('pagebuilder')) ?>;
window.pageComponents = <?= $pageRenderer->getPageComponents() ?>;
window.dynamicBlocks = <?= $pageRenderer->getDynamicBlocks() ?>;

window.editor = grapesjs.init({
    container: '#gjs',
    noticeOnUnload: false,
    avoidInlineStyle: true,
    storageManager: {
        type: 'remote',
        autoload: false,
        autosave: false,
        urlStore: '<?= phpb_route('?route=pagebuilder&action=store&page=' . $page->id) ?>',
    },
    styleManager: {
        textNoElement: '<?= phpb_trans('pagebuilder.style-no-element-selected') ?>',
        sectors: [{
            name: '<?= phpb_trans('pagebuilder.style-manager.sectors.position') ?>',
            open: true,
            buildProps: ['width', 'height', 'min-width', 'min-height', 'max-width', 'max-height', 'padding', 'margin']
        }, {
            name: '<?= phpb_trans('pagebuilder.style-manager.sectors.background') ?>',
            open: false,
            buildProps: ['background-color', 'background']
        }]
    },
    selectorManager: {
        label: '<?= phpb_trans('pagebuilder.selector-manager.label') ?>',
        statesLabel: '<?= phpb_trans('pagebuilder.selector-manager.states-label') ?>',
        selectedLabel: '<?= phpb_trans('pagebuilder.selector-manager.selected-label') ?>',
        states: [
            {name: 'hover', label: '<?= phpb_trans('pagebuilder.selector-manager.state-hover') ?>'},
            {name: 'active', label: '<?= phpb_trans('pagebuilder.selector-manager.state-active') ?>'},
            {name: 'nth-of-type(2n)', label: '<?= phpb_trans('pagebuilder.selector-manager.state-nth') ?>'}
        ],
    },
    traitManager: {
        textNoElement: '<?= phpb_trans('pagebuilder.trait-no-element-selected') ?>',
        labelContainer: '<?= phpb_trans('pagebuilder.trait-settings') ?>',
        labelPlhText: '',
        labelPlhHref: 'https://website.com',
        optionsTarget: [
            {value: '', name: '<?= phpb_trans('pagebuilder.trait-this-window') ?>'},
            {value: '_blank', name: '<?= phpb_trans('pagebuilder.trait-new-window') ?>'}
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
    },
    plugins: ['grapesjs-touch', 'gjs-plugin-ckeditor'],
    pluginsOpts: {
        'gjs-plugin-ckeditor': {
            position: 'left',
            options: {
                startupFocus: true,
                extraAllowedContent: '*(*);*{*}', // Allows any class and any inline style
                allowedContent: true, // Disable auto-formatting, class removing, etc.
                enterMode: CKEDITOR.ENTER_BR,
                extraPlugins: 'sharedspace, justify, colorbutton, panelbutton, font',
                toolbar: [
                    {name: 'styles', items: ['Font', 'FontSize']},
                    ['Bold', 'Italic', 'Underline', 'Strike'],
                    {name: 'links', items: ['Link', 'Unlink']},
                    {name: 'colors', items: ['TextColor', 'BGColor']},
                ],
            }
        }
    },
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

<?php
require __DIR__ . '/settings-manager.php';
require __DIR__ . '/style-manager.php';
?>

<button id="toggle-sidebar" class="btn">
    <i class="fa fa-bars"></i>
</button>
<div id="sidebar-header">
</div>

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
