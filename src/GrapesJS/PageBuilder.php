<?php

namespace PHPageBuilder\GrapesJS;

use PHPageBuilder\Contracts\PageBuilderContract;

class PageBuilder implements PageBuilderContract
{
    /**
     * PageBuilderController constructor.
     */
    public function __construct()
    {
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
