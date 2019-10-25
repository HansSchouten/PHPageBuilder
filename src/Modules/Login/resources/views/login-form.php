<div class="py-5 text-center">
    <h2><?= phpb_trans('login.title') ?></h2>
</div>

<div class="row">
    <div class="col-12">
        <form class="login-form mt-3" method="post" action="?route=login">
            <?php
            if (phpb_flash('message')):
                ?>
                <div class="alert alert-<?= phpb_flash('message-type') ?>">
                    <?= phpb_flash('message') ?>
                </div>
            <?php
            endif;
            ?>

            <input type="text" name="username" class="form-control mb-2" placeholder="<?= phpb_trans('login.username') ?>" required autofocus>
            <input type="password" name="password" class="form-control mb-4" placeholder="<?= phpb_trans('login.password') ?>" required>

            <button class="btn btn-lg btn-primary btn-block" type="submit"><?= phpb_trans('login.login-button') ?></button>
        </form>
    </div>
</div>
