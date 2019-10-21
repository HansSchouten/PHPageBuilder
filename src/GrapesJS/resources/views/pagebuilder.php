
<div id="gjs">
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
    fromElement: true,
    canvas: {
        styles: [
            'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'
        ],
        scripts: [
            'https://code.jquery.com/jquery-3.3.1.slim.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js',
            'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js'
        ],
    }
});

let blockManager = editor.BlockManager;

<?php
foreach ($blocks as $block):
?>
blockManager.add(<?= json_encode($block->getId()) ?>, <?= json_encode($block->getBlockArray()) ?>);
<?php
endforeach;
?>

</script>
