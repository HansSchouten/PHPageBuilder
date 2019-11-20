<?php

namespace PHPageBuilder\Contracts;

interface PageBuilderContract
{
    /**
     * Process the current GET or POST request and redirect or render the requested page.
     *
     * @param $route
     * @param $action
     * @param PageContract|null $page
     */
    public function handleRequest($route, $action, PageContract $page = null);

    /**
     * Render the given page inside the PageBuilder.
     *
     * @param PageContract $page
     */
    public function renderPageBuilder(PageContract $page);

    /**
     * Render the given page.
     *
     * @param PageContract $page
     */
    public function renderPage(PageContract $page);

    /**
     * Update the given page with the given data (an array of html blocks)
     *
     * @param PageContract $page
     * @param $data
     * @return bool|object|null
     */
    public function updatePage(PageContract $page, $data);
}
