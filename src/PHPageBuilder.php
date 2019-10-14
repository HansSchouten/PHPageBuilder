<?php

namespace PHPageBuilder;

class PHPageBuilder
{
    /**
     * @var array $config
     */
    protected $config;

    /**
     * PHPageBuilder constructor.
     *
     * @param array $config   configuration in the format defined in config/pagebuilder.example.php
     */
    public function __construct($config)
    {
        $this->config = $config;
    }

    /**
     * Return all blocks of the current theme.
     */
    public function getThemeBlocks()
    {
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
