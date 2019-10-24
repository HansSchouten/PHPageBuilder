# PHPagebuilder
PHPagebuilder is a drag and drop pagebuilder to manage pages in any PHP project.

## How does it help me?
PHPagebuilder comes in handy for the following use cases.
- You want to build a website for a friend or a client within a few hours.
- You or your clients get lost in feature abundant admin panels like Drupal.
- You have coding experience, but hate to add all these messy Wordpress plugins for features you can write in no-time yourself.

**Just download any (free) HTML5 template, cut it into blocks and attach PHPagebuilder.**

Do you already have a great project, or want to keep using your favorite framework?

Add PHPagebuilder to your project and integrate it by manually calling or overriding a number of PHPagebuilder's components.

## Features

### Page Builder
PHPagebuilder features a page builder built on [GrapesJS](https://grapesjs.com/).
![PageBuilder](https://user-images.githubusercontent.com/5946444/67138504-723fea00-f244-11e9-84ca-f211d7ed294b.png)

### Website Manager
A basic website manager is included with a [Bootstrap](https://getbootstrap.com/) UI. This website manager offers functionality to add or remove pages and to edit page settings like page title or URL. Clicking the edit button will open the page builder.
![Website Manager](https://user-images.githubusercontent.com/5946444/67484882-4029f000-f669-11e9-9a1f-8a0e1c53e308.jpg)

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

Just download the latest release into a separate folder inside your project (we named the folder: `phpagebuilder`).

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

## Customization

PHPagebuilder is build to be very easy to customize to your needs. It comes with an example config file in wich you can adapt the pagebuilder to your needs.
