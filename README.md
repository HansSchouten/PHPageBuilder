

# PHPagebuilder
> PHPagebuilder is a drag and drop pagebuilder to manage pages in any PHP project.

PHPagebuilder can be used as a ultra lightweight CMS to set up new projects, or can be integrated into existing projects or your favorite frameworks (such as [this version](https://github.com/HansSchouten/Laravel-Pagebuilder) for Laravel). The server-side code does not depend on any other libraries and is blazing fast. It includes an optional website manager with a [Bootstrap UI](https://getbootstrap.com) and integrates the most popular open source drag and drop pagebuilder: [GrapesJS](https://grapesjs.com/). This package is made with customization in mind, allowing you to configure, disable or replace any of its modules.

## Table of Contents
- [How does it help me?](#how-does-it-help-me)
- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Customization](#customization)

## How does it help me?
Whether you are a novice or an experienced web developer, PHPagebuilder can make your life easier if you find yourself in any of the points below:

- You just want to create a basic website that you can easily manage from any device.
- You get lost installing, configuring, updating or simply using feature abundant CMS systems like Wordpress, Drupal.
- You don't like the limited page editors in CMS systems you've tried.
- You want to build a custom website for a client within a few hours.
- Your clients get lost in feature abundant admin panels like Drupal.
- You hate to rely on messy (WordPress) plugins for features you can write in no-time yourself, but still want to have some admin functionality to allow other people to manage the websites you create.
- You would like to have advanced functionality (search functionality, views that display data of remote sources, etc.) easily manageable by your clients.

## Quick Start
If you want to quickly start a project with drag and drop page management functionality, you follow these steps:

- Create or download any HTML5 template ([Bootstrap](https://themes.getbootstrap.com/), [ThemeForest](https://themeforest.net/popular_item/by_category?category=site-templates), [Colorlib](https://colorlib.com/wp/templates/), etc)
- Cut your template into blocks
- [Attach PHPagebuilder](#installation)

## Features

### Page Builder
PHPagebuilder features a page builder built on [GrapesJS](https://grapesjs.com/).
![PageBuilder](https://user-images.githubusercontent.com/5946444/67138504-723fea00-f244-11e9-84ca-f211d7ed294b.png)

### Website Manager
A basic website manager is included with a [Bootstrap](https://getbootstrap.com/) UI. This website manager offers basic functionality to add or remove pages and to edit page settings like page title or URL. Clicking the edit button will open the page builder.
![Website Manager](https://user-images.githubusercontent.com/5946444/67484882-4029f000-f669-11e9-9a1f-8a0e1c53e308.jpg)

You don't want to use the website manager? No worries, it is included for people who want to use PHPagebuilder directly out of the box. Read [here](#customize-the-website-manager) how to disable or replace the website manager.

## Installation

### Adding the code

#### With Composer
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

#### Without Composer
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

### Configure a database
If you use PHPagebuilder out of the box, it requires a database for storing your pages. Just create a database and run the queries from `config/create-tables.sql`. Next, add the database credentials to your config file.

## Customization

PHPagebuilder is build with customization in mind. It comes with an extensive example config file in wich you can easily adapt the pagebuilder to your needs.

PHPagebuilder consist of four modules (Login, Website Manager, Pagebuilder, Routing) each of which you can disable or replace with your own implementation. To replace a module with your own implementation, implement the corresponding Contract and replace the default class by your own class in the config file.

Instead of relying on the PHPageBuilder class to handle all requests, you can also integrate the page builder into your project by calling methods on its modules. For example, instantiating `PHPageBuilder\Modules\GrapesJS\PageBuilder` allows you to directly render the pagebuilder for any page you provide.

### Customize the Website Manager
#### Disable the module
Do you already have admin login functionality in your project? Then you can disable the website manager module by setting  `use_website_manager` to `false` in your config. Next, you use or implement the page create/edit/remove functionality in your project and then directly launch the pagebuilder. You can render the pagebuilder from your project by using the `PHPageBuilder\Modules\GrapesJS\PageBuilder` class.

#### Replace the module
If you want use the CMS routing functionality of PHPagebuilder, but you want to have a different website manager, you can replace the website manager for your own implementation. Make sure leave `use_website_manager` to `true` in your config, implement the WebsiteManagerContract and add your own class to your config file.
