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
        //
        'router_class' => '',
    ],
];
