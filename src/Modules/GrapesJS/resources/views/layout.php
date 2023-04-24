<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>PageBuilder</title>
    <meta name="viewport" content="width=device-width, initial-scale=0.9, maximum-scale=0.9, user-scalable=no">

    <link rel="stylesheet" href="<?= phpb_asset('pagebuilder/grapesjs-v0.15.9.min.css') ?>">
    <link rel="stylesheet" href="<?= phpb_asset('pagebuilder/bootstrap-v4.3.1.min.css') ?>">
    <link rel="stylesheet" href="<?= phpb_asset('pagebuilder/bootstrap-select-v1.13.12.min.css') ?>">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="<?= phpb_asset('pagebuilder/toastr-v2.1.3.min.css') ?>">
    <link rel="stylesheet" href="<?= phpb_asset('pagebuilder/app.css') ?>">
    <?= $pageBuilder->customStyle(); ?>

    <script src="<?= phpb_asset('pagebuilder/grapesjs-v0.15.9.min.js') ?>"></script>
    <script src="<?= phpb_asset('pagebuilder/underscore-v1.9.1.min.js') ?>"></script>
    <script src="<?= phpb_asset('pagebuilder/jquery-3.4.1.min.js') ?>"></script>
    <script src="<?= phpb_asset('pagebuilder/popper-v1.12.9.min.js') ?>"></script>
    <script src="<?= phpb_asset('pagebuilder/bootstrap-v4.3.1.min.js') ?>"></script>
    <script src="<?= phpb_asset('pagebuilder/bootstrap-select-v1.13.12.min.js') ?>"></script>
    <script src="<?= phpb_asset('pagebuilder/toastr-v2.1.3.min.js') ?>"></script>
    <script src="<?= phpb_asset('pagebuilder/beautify-html-v1.10.2.min.js') ?>"></script>
    <?= $pageBuilder->customScripts('head'); ?>
</head>

<body>

<?php
require __DIR__ . '/pagebuilder.php';
?>

<script src="<?= phpb_asset('pagebuilder/app.js') ?>"></script>
<?= $pageBuilder->customScripts('body'); ?>
</body>
</html>
