<?php

namespace PHPageBuilder\GrapesJS;

use PHPageBuilder\Contracts\PageBuilderContract;
use PHPageBuilder\Contracts\PageContract;
use PHPageBuilder\PageRepository;
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
            $pageId = isset($_GET['page']) ? $_GET['page'] : null;
            $pageRepository = new PageRepository;
            $page = $pageRepository->findWithId($pageId);

            $this->renderPageBuilder($page);
            exit();
        }
    }

    /**
     * Render the PageBuilder for the given page.
     *
     * @param PageContract $page
     */
    public function renderPageBuilder(PageContract $page)
    {
        // init variables that should be accessible in the view
        $pageBuilder = $this;
        $pageRenderer = new PageRenderer($page);

        // create an array of theme block adapters, adapting each theme block to the representation for GrapesJS
        $blocks = [];
        foreach ($this->context->getTheme()->getThemeBlocks() as $themeBlock) {
            $blocks[] = new PageBuilderBlockAdapter($themeBlock);
        }

        require __DIR__ . '/resources/views/layout.php';
    }
}
