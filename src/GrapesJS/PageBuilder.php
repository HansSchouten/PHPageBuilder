<?php

namespace PHPageBuilder\GrapesJS;

use PHPageBuilder\Contracts\PageBuilderContract;
use PHPageBuilder\PHPageBuilder;

class PageBuilder implements PageBuilderContract
{
    /**
     * @var PHPageBuilder $context;
     */
    protected $context;

    /**
     * PageBuilder constructor.
     *
     * @param PHPageBuilder $context
     */
    public function __construct(PHPageBuilder $context)
    {
        $this->context = $context;
    }

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
            exit();
        }
    }

    /**
     * Render the PageBuilder.
     */
    public function renderPageBuilder()
    {
        // create an array of theme block adapters, adapting each theme block to the representation for GrapesJS
        $blocks = [];
        foreach ($this->context->getTheme()->getThemeBlocks() as $themeBlock) {
            $blocks[] = new ThemeBlockAdapter($themeBlock);
        }

        require __DIR__ . '/resources/views/layout.php';
    }
}
