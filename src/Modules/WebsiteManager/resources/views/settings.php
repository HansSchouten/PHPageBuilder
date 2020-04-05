<?php
$setting = phpb_instance('setting');
?>

<form method="post" action="<?= phpb_url('website_manager', ['route' => 'settings', 'action' => 'update', 'tab' => 'settings']) ?>">

    <div class="main-spacing">
        <?php
        if (phpb_flash('message')):
        ?>
        <div class="alert alert-<?= phpb_flash('message-type') ?>">
            <?= phpb_flash('message') ?>
        </div>
        <?php
        endif;
        ?>

        <div class="form-group required">
            <label for="languages">
                <?= phpb_trans('website-manager.website-languages') ?>
            </label>
            <select class="form-control" id="languages" name="languages[]" title="<?= phpb_trans('website-manager.languages-selector-placeholder') ?>" required multiple>
                <option value="en" <?= $setting::has('languages', 'en') ? 'selected' : '' ?>>English</option>
                <option value="nl" <?= $setting::has('languages', 'nl') ? 'selected' : '' ?>>Nederlands</option>
                <option value="es" <?= $setting::has('languages', 'es') ? 'selected' : '' ?>>Espanol</option>
                <option value="fr" <?= $setting::has('languages', 'fr') ? 'selected' : '' ?>>Français</option>
                <option value="de" <?= $setting::has('languages', 'de') ? 'selected' : '' ?>>Deutsch</option>
            </select>
        </div>

        <hr class="mb-3">

        <button class="btn btn-primary btn-sm">
            <?= phpb_trans('website-manager.save-settings'); ?>
        </button>
    </div>

    <div class="main-spacing mt-5">
        <label class="d-block">
            <?= phpb_trans('website-manager.pagebuilder-block-images') ?>
        </label>
        <a href="<?= phpb_url('website_manager', ['route' => 'settings', 'action' => 'renderBlockThumbs']) ?>" class="btn btn-secondary btn-sm mr-1">
            <?= phpb_trans('website-manager.render-thumbs') ?>
        </a>
    </div>

</form>
