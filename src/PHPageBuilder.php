<?php

namespace PHPageBuilder;

class PHPageBuilder
{
    /**
     * @var array $config
     */
    protected $config;

    /**
     * @var Theme $theme
     */
    protected $theme;

    /**
     * PHPageBuilder constructor.
     *
     * @param array $config         configuration in the format defined in config/pagebuilder.example.php
     * @param string $themeSlug
     */
    public function __construct(array $config, string $themeSlug)
    {
        $this->config = $config;
        $this->theme = new Theme($this, $config['themes'], $themeSlug);
    }

    /**
     * Return the Theme instance of this PageBuilder instance.
     *
     * @return Theme
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
        // pass this PageBuilder instance
        $builder = $this;
        require_once 'resources/views/pagebuilder.php';
    }

    /**
     * Render the page of the given route.
     *
     * @param string $pageRoute
     */
    public function renderPage(string $pageRoute)
    {
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
