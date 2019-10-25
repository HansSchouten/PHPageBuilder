
<div id="gjs">
<?= $pageRenderer->render(); ?>
</div>

<script type="text/javascript">

let editor = grapesjs.init({
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
                        attributes: {title: 'Open Blocks'},
                        active: true,
                    },
                    {
                        id: 'open-layers',
                        className: 'fa fa-bars',
                        command: 'open-layers',
                        togglable: 0,
                        attributes: {title: 'Open Layer Manager'}
                    },
                    {
                        id: 'open-tm',
                        className: 'fa fa-cog',
                        command: 'open-tm',
                        togglable: 0,
                        attributes: {title: 'Settings'}
                    },
                    {
                        id: 'open-sm',
                        className: 'fa fa-paint-brush',
                        command: 'open-sm',
                        togglable: 0,
                        attributes: {title: 'Open Style Manager'}
                    }
                ]
            }
        ]
    },
    fromElement: true,
    canvas: {
        /*
        styles: [
            'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'
        ],
        scripts: [
            'https://code.jquery.com/jquery-3.3.1.slim.min.js',
        ]
        */
    }
});

const canvas = editor.Canvas;

editor.on('block:drag:stop', droppedComponent => {
    updateComponentAccess(droppedComponent);
    droppedComponent.set({
        removable: true,
        draggable: true,
        copyable: true,
        selectable: true,
        hoverable: true,
    })
});

const updateComponentAccess = (component) => {
    component.set({
        removable: false,
        draggable: false,
        droppable: false,
        badgable: false,
        stylable: false,
        highlightable: false,
        copyable: false,
        resizable: false,
        editable: false,
        layerable: false,
        selectable: false,
        hoverable: false
    });
    if ('gjs-editable' in component.attributes.attributes) {
        component.set({
            hoverable: true,
            selectable: true,
            editable: true,
        })
    }
    component.get('components').each(c => updateComponentAccess(c));
};

let blockManager = editor.BlockManager;
<?php
foreach ($blocks as $block):
?>
blockManager.add(<?= json_encode($block->getId()) ?>, <?= json_encode($block->getBlockArray()) ?>);
<?php
endforeach;
?>

</script>
