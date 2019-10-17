<?php

namespace PHPageBuilder\Router;

use PHPageBuilder\Contracts\RouterContract;

class DatabasePageRouter implements RouterContract
{
    /**
     * Return the page from database corresponding to the given route.
     *
     * @param $route
     * @return mixed
     */
    public function resolve($route)
    {
        return null;
    }
}
