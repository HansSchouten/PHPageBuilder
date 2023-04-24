<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title><?= phpb_trans('website-manager.title') ?></title>

    <link rel="stylesheet" href="<?= phpb_asset('pagebuilder/bootstrap-v4.3.1.min.css') ?>">
    <link rel="stylesheet" href="<?= phpb_asset('pagebuilder/bootstrap-select-v1.13.12.min.css') ?>">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" crossorigin="anonymous">

    <link href="<?= phpb_asset('websitemanager/app.css') ?>" rel="stylesheet">
</head>
<body class="bg-light">

<div class="container">
    <?php
    if (phpb_config('auth.use_login')):
    ?>
    <a href="<?= phpb_url('auth', ['action' => 'logout']) ?>" class="btn btn-light clear btn-sm mt-1 float-right">
        <i class="fas fa-sign-out-alt"></i> <?= phpb_trans('website-manager.logout') ?>
    </a>
    <?php
    endif;
    ?>

    <?php
    require __DIR__ . '/../views/' . $viewFile . '.php';
    ?>

    <footer class="my-5 pt-5 text-muted text-center text-small">
        <p class="mb-1">Powered by <a href="https://github.com/HansSchouten/PHPageBuilder" target="_blank">PHPageBuilder</a></p>
    </footer>
</div>

<script src="<?= phpb_asset('pagebuilder/jquery-3.4.1.min.js') ?>"></script>
<script src="<?= phpb_asset('pagebuilder/popper-v1.12.9.min.js') ?>"></script>
<script src="<?= phpb_asset('pagebuilder/bootstrap-v4.3.1.min.js') ?>"></script>
<script src="<?= phpb_asset('pagebuilder/bootstrap-select-v1.13.12.min.js') ?>"></script>
<script src="<?= phpb_asset('websitemanager/app.js') ?>"></script>
</body>
</html>
