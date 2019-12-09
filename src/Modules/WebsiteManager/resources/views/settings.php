<form method="post" action="<?= phpb_url('website_manager', ['route' => 'settings', 'action' => 'edit', 'tab' => 'settings']) ?>">

    <div class="main-spacing">
        <a href="<?= phpb_url('website_manager', ['route' => 'settings', 'action' => 'renderBlockThumbs']) ?>" class="btn btn-primary btn-sm mr-1">
            <?= phpb_trans('website-manager.render-thumbs') ?>
        </a>
    </div>

</form>
