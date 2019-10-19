<?php

namespace PHPageBuilder\Contracts;

interface PageBuilderContract
{
    /**
     * Process the current GET or POST request and redirect or render the requested page.
     *
     * @param $route
     * @param $action
     */
    public function handleRequest($route, $action);

    /**
     * Render the PageBuilder.
     */
    public function renderPageBuilder();
}
