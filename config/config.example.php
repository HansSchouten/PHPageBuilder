<?php

return [
    /*
     |--------------------------------------------------------------------------
     | Project settings
     |--------------------------------------------------------------------------
     |
     | Settings related to the project in which the PageBuilder is included.
     |
     */
    'project' => [
        'public_folder' => __DIR__ . '/public',
        'language' => 'en',
    ],

    /*
     |--------------------------------------------------------------------------
     | Storage settings
     |--------------------------------------------------------------------------
     |
     | Database and file storage settings.
     |
     */
    'storage' => [
        'use_database' => true,
        'database' => [
            'driver'    => 'mysql',
            'host'      => 'localhost',
            'database'  => '',
            'username'  => '',
            'password'  => '',
            'charset'   => 'utf8',
            'collation' => 'utf8_unicode_ci',
            'prefix'    => '',
        ],
        'uploads_folder' => __DIR__ . '/uploads'
    ],

    /*
     |--------------------------------------------------------------------------
     | Login settings
     |--------------------------------------------------------------------------
     |
     | By default a login class is provided which checks for the credentials
     | configured in this setting block.
     |
     */
    'login' => [
        'use_login' => true,
        'class' => PHPageBuilder\Modules\Login\Login::class,
        'username' => 'admin',
        'password' => 'changethispassword'
    ],

    /*
     |--------------------------------------------------------------------------
     | WebsiteManager settings
     |--------------------------------------------------------------------------
     |
     | By default a basic WebsiteManager is provided for creating/editing pages.
     |
     */
    'website_manager' => [
        'use_website_manager' => true,
        'class' => PHPageBuilder\Modules\WebsiteManager\WebsiteManager::class,
        'routes' => [
            'index' => '/admin'
        ]
    ],

    /*
     |--------------------------------------------------------------------------
     | PageBuilder settings
     |--------------------------------------------------------------------------
     |
     | By default a PageBuilder is provided based on GrapesJS.
     |
     */
    'pagebuilder' => [
        'class' => PHPageBuilder\Modules\GrapesJS\PageBuilder::class,
        'routes' => [
            'index' => '/admin/pagebuilder'
        ]
    ],

    /*
     |--------------------------------------------------------------------------
     | Page settings
     |--------------------------------------------------------------------------
     |
     | By default a Page class is provided with knowledge about its layout and URL.
     |
     */
    'page' => [
        'class' => PHPageBuilder\Page::class,
    ],

    /*
     |--------------------------------------------------------------------------
     | Themes settings
     |--------------------------------------------------------------------------
     |
     | PageBuilder requires a themes folder in which for each theme the individual
     | theme blocks are defined. A theme block is a sub folder in the themes folder
     | containing a view, model (optional) and controller (optional).
     |
     */
    'themes' => [
        'folder' => __DIR__ . '/themes',
        'folder_url' => '/themes',
        'active_theme' => 'default',
    ],

    /*
     |--------------------------------------------------------------------------
     | Routing settings
     |--------------------------------------------------------------------------
     |
     | Settings for resolving pages based on the current URI.
     |
     */
    'router' => [
        'class' => PHPageBuilder\Modules\Router\DatabasePageRouter::class
    ],
];
