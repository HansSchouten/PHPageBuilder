# PHPagebuilder
PHPagebuilder is a drag and drop pagebuilder to manage pages in any PHP project.

## Features

### Page Builder
PHPagebuilder features a page builder built on [GrapesJS](https://grapesjs.com/).
![PageBuilder](https://user-images.githubusercontent.com/5946444/67138504-723fea00-f244-11e9-84ca-f211d7ed294b.png)

### Website Manager
A basic website manager is included with a [Bootstrap](https://getbootstrap.com/) UI. This website manager offers functionality to add or remove pages and to edit page settings like page title or URL. Clicking the edit button will open the page builder.
![Website Manager](https://user-images.githubusercontent.com/5946444/67138481-fe9ddd00-f243-11e9-9045-3ef0c42dc7c6.png)

## Installation

### With Composer
If you are using Composer for managing PHP dependencies, you can simply run:
```
composer require hansschouten/phpagebuilder
```

Next, the PHPagebuilder can be initialised using the following PHP code:
```PHP
require_once __DIR__ '/vendor/autoload.php';

$config = require __DIR__ . '/config.php';

$builder = new PHPageBuilder\PHPageBuilder($config);
$builder->handleRequest();
```

`config.php` should contain a copy of `config/config.example.php`, filled with your settings.

Note: You might have to change the paths to `autoload.php` and to your `config.php` depending on the folder structure of your project.

### Without Composer
You are not using Composer? No worries, this project is written in plain PHP without any dependencies, so it can be included in any PHP project!

Just download the latest release and unzip it in a separate folder inside your project (we named the folder: `phpagebuilder`).

Next, you simply include the following code in the PHP file that should launch the page builder:

```PHP
$installationFolder = __DIR__ . '/phpagebuilder';
require_once $installationFolder . '/src/Core/helpers.php';
spl_autoload_register('phpb_autoload');

$config = require __DIR__ . '/config.php';

$builder = new PHPageBuilder\PHPageBuilder($config);
$builder->handleRequest();
```

`config.php` should contain a copy of `config/config.example.php`, filled with your settings.

Note: You might have to change the path of your `$installationFolder` and to your `config.php` depending on the folder structure of your project.
