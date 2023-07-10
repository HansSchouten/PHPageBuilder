<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>PageBuilder</title>
    <meta name="viewport" content="width=device-width, initial-scale=0.9, maximum-scale=0.9, user-scalable=no">

    <link rel="stylesheet" href="<?= phpb_asset('pagebuilder/grapes.min.css') ?>">
    <link rel="stylesheet" href="<?= phpb_asset('static/css/bootstrap.min.css') ?>">
    <link rel="stylesheet" href="<?= phpb_asset('static/css/bootstrap-select.min.css') ?>">
    <link rel="stylesheet" href="<?= phpb_asset('static/css/font-awesome.min.css') ?>">
    <link rel="stylesheet" href="<?= phpb_asset('static/css/toastr.min.css') ?>">
    <link rel="stylesheet" href="<?= phpb_asset('pagebuilder/app.css') ?>">
    <!-- TODO: hard coded css style -->
    <style>
        .CodeMirror-code {
            text-align: left;
        }

        .code-panel section .codepanel-separator {
            display: flex;
            justify-content: space-between;
            padding-left: 0.6rem;
            padding-right: 0.6rem;
        }

        .code-panel section .codepanel-label {
            margin-top: 5px;
            line-height: 20px;
            font-size: 13px;
            user-select: none;
            text-transform: uppercase;
            padding: 5px;
        }

        .cp-btn-container {
            display: flex;
            justify-content: space-evenly;
        }

        .gjs-btn-prim {
            color: inherit;
            background-color: rgba(255,255,255,.1);
            border-radius: 2px;
            padding: 5px;
            cursor: pointer;
            border: none;
        }

        .cp-btn-container .gjs-btn-prim {
            margin: 2.5px;
        }
    </style>
    <?= $pageBuilder->customStyle(); ?>
    <?= $pageBuilder->customStyle(); ?>

    <!--    Hard coded to use local grapes.min.js -->
    <script type="text/javascript" src="<?= phpb_asset('pagebuilder/grapes.min.js') ?>"></script>
    <script src="<?= phpb_asset('static/js/underscore-min.js') ?>"></script>
    <script src="<?= phpb_asset('static/js/jquery-3.4.1.min.js') ?>"></script>
    <script src="<?= phpb_asset('static/js/popper.min.js') ?>"></script>
    <script src="<?= phpb_asset('static/js/bootstrap.min.js') ?>"></script>
    <script src="<?= phpb_asset('static/js/bootstrap-select.min.js') ?>"></script>
    <script src="<?= phpb_asset('static/js/toastr.min.js') ?>"></script>
    <script src="<?= phpb_asset('static/js/beautify-html.min.js') ?>"></script>
    <?= $pageBuilder->customScripts('head'); ?>
</head>

<body>

<?php
require __DIR__ . '/pagebuilder.php';
?>

<script src="<?= phpb_asset('pagebuilder/app.js') ?>"></script>
<?= $pageBuilder->customScripts('body'); ?>
</body>

<style>
    #cke_93_uiElement {
        display: none;
    }
</style>
</html>
