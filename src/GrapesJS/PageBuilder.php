<?php

namespace PHPageBuilder\GrapesJS;

use PHPageBuilder\Contracts\PageBuilderContract;

class PageBuilder implements PageBuilderContract
{
    /**
     * Process the current GET or POST request and redirect or render the requested page.
     *
     * @param $route
     * @param $action
     */
    public function handleRequest($route, $action)
    {
        if ($route === 'pagebuilder') {
            $this->renderPageBuilder();
        }
    }

    /**
     * Render the PageBuilder.
     */
    public function renderPageBuilder()
    {
        // pass this PageBuilder instance
        $builder = $this;
        require_once 'resources/views/pagebuilder.php';
    }
}
