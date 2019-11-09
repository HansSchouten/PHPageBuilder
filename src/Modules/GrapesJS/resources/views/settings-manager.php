<script type="text/javascript">

editor.DomComponents.addType('text', {
    model: {
        defaults: {
            traits: [],
            attributes: {},
        },
    },
});

editor.DomComponents.addType('default', {
    model: {
        defaults: {
            traits: [],
            attributes: {},
        },
    },
});

<?php
$settings = [];
foreach ($blocks as $block) {
    $settings[$block->getSlug()] = $block->getBlockSettingsArray();
}
?>

window.blockSettings = <?= json_encode($settings) ?>;

</script>
