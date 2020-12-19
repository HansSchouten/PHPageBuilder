<?php

namespace PHPageBuilder;

use DirectoryIterator;
use PHPageBuilder\Contracts\ThemeContract;

class Theme implements ThemeContract
{
    /**
     * @var array $config
     */
    protected $config;

    /**
     * @var string $themeSlug
     */
    protected $themeSlug;

    /**
     * @var array $blocks
     */
    protected $blocks;

    /**
     * @var array $layouts
     */
    protected $layouts;

    /**
     * Theme constructor.
     *
     * @param array $config
     * @param string $themeSlug
     */
    public function __construct(array $config, string $themeSlug)
    {
        $this->config = $config;
        $this->themeSlug = $themeSlug;
    }

    /**
     * Load all blocks of the current theme.
     */
    protected function loadThemeBlocks()
    {
        $this->blocks = [];

        if (! file_exists($this->getFolder() . '/blocks')) {
            return;
        }

        $blocksDirectory = new DirectoryIterator($this->getFolder() . '/blocks');
        foreach ($blocksDirectory as $entry) {
            if ($entry->isDir() && ! $entry->isDot()) {
                $blockSlug = $entry->getFilename();
                $block = new ThemeBlock($this, $blockSlug);
                $this->blocks[$blockSlug] = $block;
            }
        }
    }

    /**
     * Load all layouts of the current theme.
     */
    protected function loadThemeLayouts()
    {
        $this->layouts = [];

        if (! file_exists($this->getFolder() . '/layouts')) {
            return;
        }

        $layoutsDirectory = new DirectoryIterator($this->getFolder() . '/layouts');
        foreach ($layoutsDirectory as $entry) {
            if ($entry->isDir() && ! $entry->isDot()) {
                $layoutSlug = $entry->getFilename();
                $layout = new ThemeLayout($this, $layoutSlug);
                $this->layouts[$layoutSlug] = $layout;
            }
        }
    }

    /**
     * Return all blocks of this theme.
     *
     * @return array        array of ThemeBlock instances
     */
    public function getThemeBlocks()
    {
        $this->loadThemeBlocks();
        return $this->blocks;
    }

    /**
     * Return all layouts of this theme.
     *
     * @return array        array of ThemeLayout instances
     */
    public function getThemeLayouts()
    {
        $this->loadThemeLayouts();
        return $this->layouts;
    }

    /**
     * Return the absolute folder path of the theme passed to this Theme instance.
     *
     * @return string
     */
    public function getFolder()
    {
        return $this->config['folder'] . '/' . basename($this->themeSlug);
    }
}
