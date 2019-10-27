<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>PageBuilder</title>

    <link rel="stylesheet" href="https://unpkg.com/grapesjs/dist/css/grapes.min.css">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="<?= phpb_asset('pagebuilder/app.css') ?>">

    <script src="https://unpkg.com/grapesjs"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.9.1/underscore-min.js"></script>
    <script src="https://code.jquery.com/jquery-3.4.1.slim.js" integrity="sha256-BTlTdQO9/fascB1drekrDVkaKd9PkwBymMlHOiG+qLI=" crossorigin="anonymous"></script>
    <script src="<?= phpb_asset('pagebuilder/app.js') ?>"></script>
</head>

<body>

<?php
require __DIR__ . '/pagebuilder.php';
?>

</body>
</html>
