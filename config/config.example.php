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
        'public_folder' => '',
        'pagebuilder_url' => '/admin/',
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
        ]
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
        'login_class' => PHPageBuilder\Modules\Login\Login::class,
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
        'website_manager_class' => PHPageBuilder\Modules\WebsiteManager\WebsiteManager::class,
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
        'pagebuilder_class' => PHPageBuilder\Modules\GrapesJS\PageBuilder::class,
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
        'folder' => '',
        'folder_url' => '/themes',
        'active_theme' => '',
    ],

    /*
     |--------------------------------------------------------------------------
     | Routing settings
     |--------------------------------------------------------------------------
     |
     | Settings for resolving pages based on the current URI.
     |
     */
    'routing' => [
        'router_class' => PHPageBuilder\Modules\Router\DatabasePageRouter::class
    ],
];
