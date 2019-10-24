
# PHPagebuilder
PHPagebuilder is a drag and drop pagebuilder to manage pages in any PHP project.

## How does it help me?
PHPagebuilder comes in handy for the following use cases:

#### I have little or no web development experience
- You just want to create a basic website that you can easily manage from any device.
- You get lost installing, configuring, updating or simply using feature abundant CMS systems like Wordpress, Drupal.
- You don't like the page editors in CMS systems you've tried.

#### I am experienced
- You want to build a custom website for a client within a few hours.
- Your clients get lost in feature abundant admin panels like Drupal.
- You hate to rely on messy (WordPress) plugins for features you can write in no-time yourself, but still want to have some admin functionality to allow other people to manage the websites you create.
- You would like to have advanced functionality (search functionality, views that display data of remote sources, etc.) easily manageable by your clients.

If you find yourself in any of the above, there are two starting points:
1. Create or download any HTML5 template ([Bootstrap](https://themes.getbootstrap.com/), [ThemeForest](https://themeforest.net/popular_item/by_category?category=site-templates), [Colorlib](https://colorlib.com/wp/templates/), etc), cut it into blocks and [attach PHPagebuilder](#installation).
2. You have a great project, or want to keep using your favorite framework? Add PHPagebuilder to your project and integrate it by manually calling or overriding a number of PHPagebuilder's components. See the [customization section](#customization) for more information.

## Features

### Page Builder
PHPagebuilder features a page builder built on [GrapesJS](https://grapesjs.com/).
![PageBuilder](https://user-images.githubusercontent.com/5946444/67138504-723fea00-f244-11e9-84ca-f211d7ed294b.png)

### Website Manager
A basic website manager is included with a [Bootstrap](https://getbootstrap.com/) UI. This website manager offers basic functionality to add or remove pages and to edit page settings like page title or URL. Clicking the edit button will open the page builder.
![Website Manager](https://user-images.githubusercontent.com/5946444/67484882-4029f000-f669-11e9-9a1f-8a0e1c53e308.jpg)

You don't like the website manager? No worries, it is only included for people who want to use PHPagebuilder directly out of the box.

By setting `use_website_manager` to `false` in your config, you won't see the website manager ever again. You can render the pagebuilder yourself by using the `PHPageBuilder\Modules\GrapesJS\PageBuilder` class. You can also leave `use_website_manager` to `true`, implement the WebsiteManagerContract and add your own class to your config file.

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
Are you not using Composer? No worries, this project is written in plain PHP without any dependencies, so it can be easily included in any PHP project!

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

PHPagebuilder is build with customization in mind. It comes with an extensive example config file in wich you can easily adapt the pagebuilder to your needs.

PHPagebuilder consist of four modules (Login, Website Manager, Pagebuilder, Routing) each of which you can disable or replace with your own implementation. To replace a module with your own implementation, implement the corresponding Contract and replace the default class by your own class in the config file.

Instead of relying on the PHPageBuilder class to handle all requests, you can also integrate the page builder into your project by calling methods on its modules. For example, instantiating `PHPageBuilder\Modules\GrapesJS\PageBuilder` allows you to directly render the pagebuilder for any page you provide.
