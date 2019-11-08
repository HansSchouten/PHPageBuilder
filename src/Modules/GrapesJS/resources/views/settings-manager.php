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
foreach ($blocks as $block):
    $blockSettings = $block->getBlockSettingsArray();
    if (! empty($blockSettings)):
        $attributes = '{}';
        if (! empty($blockSettings['attributes'])) {
            $attributes = json_encode($blockSettings['attributes']);
        }
?>

editor.DomComponents.addType('block-<?= e($blockSettings['slug']) ?>', {
    isComponent: function(el) {
        if (el.attributes !== undefined && el.attributes['block-slug'] !== undefined) {
            return (el.attributes['block-slug'].value === '<?= e($blockSettings['slug']) ?>');
        }
        return false;
    },
    model: {
        defaults: {
            traits: <?= json_encode($blockSettings['traits']) ?>,
            attributes: <?= $attributes ?>,
        },
    },
});

<?php
    endif;
endforeach;
?>

</script>
