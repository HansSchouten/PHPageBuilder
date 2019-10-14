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
        $this->theme = new Theme($config['themes'], $themeSlug);
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
     * Render the pagebuilder.
     */
    public function render()
    {
        // render the pagebuilder view while passing this class instance as $pagebuilder
        $pagebuilder = $this;
        require_once 'resources/views/pagebuilder.php';
    }
}
