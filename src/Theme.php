<?php

namespace PHPageBuilder;

use DirectoryIterator;

class Theme
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
     * Theme constructor.
     *
     * @param array $config         themes configuration
     * @param string $themeSlug
     */
    public function __construct(array $config, string $themeSlug)
    {
        $this->config = $config;
        $this->themeSlug = $themeSlug;

        $this->loadThemeBlocks();
    }

    /**
     * Load all blocks of the current theme.
     */
    protected function loadThemeBlocks()
    {
        $this->blocks = [];
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
     * Return the absolute folder path of the theme passed to this Theme instance.
     *
     * @return string
     */
    public function getFolder()
    {
        return $this->config['folder'] . '/' . $this->themeSlug;
    }

    /**
     * Return all blocks of the current theme.
     */
    public function getThemeBlocks()
    {
        return $this->blocks;
    }
}
