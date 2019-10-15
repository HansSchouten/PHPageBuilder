<?php

namespace PHPageBuilder\Router;

interface RouterContract
{
    /**
     * Return the page corresponding to the given route.
     *
     * @param $route
     * @return mixed
     */
    public function resolve($route);
}