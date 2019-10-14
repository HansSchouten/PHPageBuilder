<?php

namespace PHPageBuilder;

use DirectoryIterator;

class Theme
{
    /**
     * @var PHPageBuilder $pageBuilder
     */
    protected $pageBuilder;

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
     * @param PHPageBuilder $pageBuilder
     * @param array $config         themes configuration
     * @param string $themeSlug
     */
    public function __construct(PHPageBuilder $pageBuilder, array $config, string $themeSlug)
    {
        $this->pageBuilder = $pageBuilder;
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

    /**
     * Render the block identified with the given block slug.
     *
     * @param string $blockSlug
     */
    public function renderBlock(string $blockSlug)
    {
        if (! isset($this->blocks[$blockSlug])) {
            return;
        }

        // pass the PageBuilder instance, this theme and the given block
        /* @var ThemeBlock $block */
        $builder = $this->pageBuilder;
        $theme = $this;
        $block = $this->blocks[$blockSlug];

        ob_start();
        require_once $block->getFolder() . '/view.php';
        $body = ob_get_contents();
        ob_end_clean();

        // render the body inside the defined layout
        $this->renderBodyInLayout($body);
    }

    /**
     * Render the given page body inside the master layout.
     *
     * @param $body
     */
    protected function renderBodyInLayout($body)
    {
        // pass the PageBuilder instance, this theme and the given block
        $builder = $this->pageBuilder;
        $theme = $this;

        require_once $this->getFolder() . '/layout.php';
    }
}
