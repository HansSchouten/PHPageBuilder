<?php

namespace PHPageBuilder\Modules\GrapesJS;

use PHPageBuilder\Contracts\PageContract;
use PHPageBuilder\Theme;
use PHPageBuilder\ThemeBlock;
use Exception;

class PageRenderer
{
    /**
     * @var Theme $theme
     */
    protected $theme;

    /**
     * @var PageContract $page
     */
    protected $page;

    /**
     * @var array $pageData
     */
    protected $pageData;

    /**
     * @var ShortcodeParser $shortcodeParser
     */
    protected $shortcodeParser;

    /**
     * @var bool $forPageBuilder
     */
    protected $forPageBuilder;

    /**
     * PageRenderer constructor.
     *
     * @param Theme $theme
     * @param PageContract $page
     * @param bool $forPageBuilder
     */
    public function __construct(Theme $theme, PageContract $page, $forPageBuilder = false)
    {
        $this->theme = $theme;
        $this->page = $page;
        $this->pageData = $page->getData();
        $this->shortcodeParser = new ShortcodeParser($this);
        $this->forPageBuilder = $forPageBuilder;
    }

    /**
     * Return the absolute path to the layout view of this page.
     *
     * @return string
     */
    public function getPageLayoutPath()
    {
        return $this->theme->getFolder() . '/layouts/' . basename($this->page->getLayout()) . '/view.php';
    }

    /**
     * Return an array with for each block of this page the stored html & settings data.
     *
     * @return array
     */
    public function getPageBlocksData()
    {
        return json_decode($this->pageData->blocks, true);
    }

    /**
     * Return the rendered version of the page.
     *
     * @return string
     * @throws Exception
     */
    public function render()
    {
        // init variables that should be accessible in the view
        $renderer = $this;
        $page = $this->page;
        if ($this->forPageBuilder) {
            $body = '<div phpb-content-container="true"></div>';
        } else {
            $body = $this->renderBody();
        }

        ob_start();
        require $this->getPageLayoutPath();
        $pageHtml = ob_get_contents();
        ob_end_clean();

        // parse any shortcodes present in the page layout
        $pageHtml = $this->shortcodeParser->doShortcodes($pageHtml);

        return $pageHtml;
    }

    /**
     * Return the page body for display on the website.
     * The body contains all blocks which are put into the selected layout.
     *
     * @return string
     * @throws Exception
     */
    public function renderBody()
    {
        $html = '';

        $data = $this->pageData;
        if (isset($data->html)) {
            $html .= $this->shortcodeParser->doShortcodes($data->html);
        }
        // include any style changes made via the pagebuilder
        if (isset($data->css)) {
            $html .= '<style>' . $data->css . '</style>';
        }

        return $html;
    }

    /**
     * Include a rendered theme block with the given slug, data instance id and data context.
     * Note: this method is called from php blocks, layout files or via shortcodes.
     *
     * @param $slug
     * @param null $id                  the id with which data for this block is stored
     * @param null $parentBlockId
     * @return false|string
     */
    public function block($slug, $id = null, $parentBlockId = null)
    {
        $html = '';
        $themeBlock = new ThemeBlock($this->theme, $slug);
        $blockData = json_decode($this->pageData->blocks, true);

        // if the block is a html block and for the given id in the given context is html data stored for this block,
        // then return that html data
        if ($themeBlock->isHtmlBlock() && ! is_null($parentBlockId)) {
            if (isset($blockData[$parentBlockId]) && isset($blockData[$parentBlockId][$id])) {
                $html = $blockData[$parentBlockId][$id];
            }
        }

        if (empty($html)) {
            $data = $blockData[$id] ?? [];
            // init variables that should be accessible in the view
            $renderer = $this;
            $page = $this->page;
            $block = new BlockViewFunctions($themeBlock, $data, $this->forPageBuilder);

            ob_start();
            require $themeBlock->getViewFile();
            $html = ob_get_contents();
            ob_end_clean();
        }

        if ($this->forPageBuilder) {
            $id = $id ?? $slug;
            $html = '<phpb-block block-slug="' . e($slug) . '" block-id="' . e($id) . '" is-html="' . ($themeBlock->isHtmlBlock() ? 'true' : 'false') . '">'
                . $html
                . '</phpb-block>';
        }

        return $html;
    }

    /**
     * Render the given theme block with blockViewFunctions to be used as a block in GrapesJS.
     *
     * @param ThemeBlock $themeBlock
     * @return string
     * @throws Exception
     */
    public function getGrapesJSBlockHtml(ThemeBlock $themeBlock)
    {
        if ($themeBlock->isHtmlBlock()) {
            $html = file_get_contents($themeBlock->getFolder() . '/view.html');
        } else {
            // init variables that should be accessible in the view
            $block = new BlockViewFunctions($themeBlock, [], true);

            ob_start();
            require $themeBlock->getFolder() . '/view.php';
            $html = ob_get_contents();
            ob_end_clean();
        }

        $html = $this->shortcodeParser->doShortcodes($html);

        $id = $slug = $themeBlock->getSlug();
        $html = '<phpb-block block-slug="' . e($slug) . '" block-id="' . e($id) . '" is-html="' . ($themeBlock->isHtmlBlock() ? 'true' : 'false') . '">'
            . $html
            . '</phpb-block>';

        return $html;
    }

    /**
     * Return this page's dynamic blocks to be loaded into the page edited inside GrapesJS.
     *
     * @return array
     * @throws Exception
     */
    public function getDynamicBlocks()
    {
        // trigger renderBody to ensure the shortcode parser has rendered versions of all dynamic blocks
        $this->renderBody();
        // return the rendered html and settings for each dynamic block
        return $this->shortcodeParser->getRenderedBlocks();
    }
}
