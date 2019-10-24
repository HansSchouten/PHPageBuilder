
<div class="py-5 text-center">
    <h2><?= phpb_trans('website-manager.title') ?></h2>
</div>

<div class="row">
    <div class="col-12">

        <div class="manager-panel">
            <form method="post" action="?route=page_settings&action=<?= e($action) ?>">
                <h4>
                    <?php
                    if ($action === 'create'):
                        echo phpb_trans('website-manager.add-new-page');
                    else:
                        echo phpb_trans('website-manager.edit-page');
                    endif;
                    ?>
                </h4>

                <div class="main-spacing">
                    <div class="form-group">
                        <label for="name">
                            <?= phpb_trans('website-manager.name') ?>
                            <span class="text-muted">(<?= phpb_trans('website-manager.visible-in-page-overview') ?>)</span>
                        </label>
                        <input type="text" class="form-control" id="name">
                    </div>

                    <div class="form-group">
                        <label for="page-title"><?= phpb_trans('website-manager.page-title') ?></label>
                        <input type="text" class="form-control" id="page-title">
                    </div>

                    <div class="form-group">
                        <label for="route"><?= phpb_trans('website-manager.route') ?></label>
                        <input type="text" class="form-control" id="route">
                    </div>

                    <div class="form-group">
                        <label for="layout"><?= phpb_trans('website-manager.layout') ?></label>
                        <select class="form-control" id="layout">
                            <?php
                            foreach ($theme->getThemeLayouts() as $layout):
                            ?>
                            <option value="<?= e($layout->getId()) ?>"><?= e($layout->get('title')) ?></option>
                            <?php
                            endforeach;
                            ?>
                        </select>
                    </div>
                </div>

                <hr class="mb-3">

                <a href="<?= phpb_route('') ?>" class="btn btn-light btn-sm mr-1">
                    <?= phpb_trans('website-manager.back') ?>
                </a>
                <button class="btn btn-primary btn-sm">
                    <?php
                    if ($action === 'create'):
                        echo phpb_trans('website-manager.add-new-page');
                    else:
                        echo phpb_trans('website-manager.save-changes');
                    endif;
                    ?>
                </button>
            </form>

        </div>
    </div>

</div>
