<?php

namespace PHPageBuilder;

use PHPageBuilder\Contracts\PageBuilderContract;
use PHPageBuilder\Contracts\RouterContract;
use PHPageBuilder\Contracts\ThemeContract;
use PHPageBuilder\GrapesJS\PageBuilder;
use PHPageBuilder\Router\DatabasePageRouter;

class PHPageBuilder
{
    /**
     * @var array $config
     */
    protected $config;

    /**
     * @var ThemeContract $theme
     */
    protected $theme;

    /**
     * @var RouterContract $router
     */
    protected $router;

    /**
     * @var PageBuilderContract $pageBuilder
     */
    protected $pageBuilder;

    /**
     * PHPageBuilder constructor.
     *
     * @param array $config         configuration in the format defined in config/pagebuilder.example.php
     * @param string|null $themeSlug
     */
    public function __construct(array $config, string $themeSlug = null)
    {
        $this->config = $config;

        if (isset($themeSlug)) {
            $this->theme = new Theme($this, $config['themes'], $themeSlug);
        }
        $this->pageBuilder = new PageBuilder;
        $this->router = new DatabasePageRouter;
    }

    /**
     * Set a custom theme.
     *
     * @param ThemeContract $theme
     */
    public function setTheme(ThemeContract $theme)
    {
        $this->theme = $theme;
    }

    /**
     * Set a custom router.
     *
     * @param RouterContract $router
     */
    public function setRouter(RouterContract $router)
    {
        $this->router = $router;
    }

    /**
     * Set a custom PageBuilder.
     *
     * @param PageBuilderContract $pageBuilder
     */
    public function setPageBuilder(PageBuilderContract $pageBuilder)
    {
        $this->pageBuilder = $pageBuilder;
    }

    /**
     * Return the Theme instance of this PageBuilder instance.
     *
     * @return ThemeContract
     */
    public function getTheme()
    {
        return $this->theme;
    }

    /**
     * Render the PageBuilder.
     */
    public function renderPageBuilder()
    {
        $this->pageBuilder->renderPageBuilder();
    }

    /**
     * Render the page of the given URI.
     *
     * @param string $URI
     */
    public function renderPage(string $URI)
    {
        $page = $this->router->resolve($URI);
    }

    /**
     * Render the block identified with the given block slug.
     *
     * @param string $blockSlug
     */
    public function renderBlock(string $blockSlug)
    {
        $this->theme->renderBlock($blockSlug);
    }
}
