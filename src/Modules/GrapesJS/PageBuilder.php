<?php

namespace PHPageBuilder\Modules\GrapesJS;

use PHPageBuilder\Contracts\PageBuilderContract;
use PHPageBuilder\Contracts\PageContract;
use PHPageBuilder\Repositories\PageRepository;
use PHPageBuilder\Theme;

class PageBuilder implements PageBuilderContract
{
    /**
     * @var Theme $theme
     */
    protected $theme;

    /**
     * PageBuilder constructor.
     */
    public function __construct()
    {
        $this->theme = new Theme(phpb_config('themes'), phpb_config('themes.active_theme'));
    }

    /**
     * Set the theme used while rendering pages in the page builder.
     *
     * @param Theme $theme
     */
    public function setTheme(Theme $theme)
    {
        $this->theme = $theme;
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
        $pageRenderer = new PageRenderer($this->theme, $page);

        // create an array of theme block adapters, adapting each theme block to the representation for GrapesJS
        $blocks = [];
        foreach ($this->theme->getThemeBlocks() as $themeBlock) {
            $blocks[] = new BlockAdapter($themeBlock);
        }

        require __DIR__ . '/resources/views/layout.php';
    }
}
