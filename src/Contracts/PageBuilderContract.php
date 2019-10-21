<?php

namespace PHPageBuilder\Contracts;

use PHPageBuilder\PHPageBuilder;

interface PageBuilderContract
{
    /**
     * PageBuilder constructor.
     *
     * @param PHPageBuilder $context
     */
    public function __construct(PHPageBuilder $context);

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
