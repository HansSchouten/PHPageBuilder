<?php

namespace PHPageBuilder\Modules\GrapesJS;

use PHPageBuilder\Contracts\PageContract;
use PHPageBuilder\Contracts\ThemeContract;
use PHPageBuilder\Modules\GrapesJS\Block\BlockRenderer;
use PHPageBuilder\ThemeBlock;
use Exception;

class PageRenderer
{
    /**
     * @var ThemeContract $theme
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
     * @var array $pageBlocksData
     */
    protected $pageBlocksData;

    /**
     * @var ShortcodeParser $shortcodeParser
     */
    protected $shortcodeParser;

    /**
     * @var bool $forPageBuilder
     */
    protected $forPageBuilder;

    /**
     * @var string $language
     */
    protected $language;

    /**
     * PageRenderer constructor.
     *
     * @param ThemeContract $theme
     * @param PageContract $page
     * @param bool $forPageBuilder
     */
    public function __construct(ThemeContract $theme, PageContract $page, $forPageBuilder = false)
    {
        $this->theme = $theme;
        $this->page = $page;
        $this->pageData = $page->getBuilderData();
        $this->setLanguage(phpb_config('general.language'));
        $this->shortcodeParser = new ShortcodeParser($this);
        $this->forPageBuilder = $forPageBuilder;
    }

    /**
     * Set which page language variant to use while rendering.
     *
     * @param $language
     */
    public function setLanguage($language)
    {
        $this->language = $language;
        $this->pageBlocksData = $this->getPageBlocksData();
    }

    /**
     * Return the absolute path to the layout view of this page.
     *
     * @return string
     */
    public function getPageLayoutPath()
    {
        $layout = basename($this->page->getLayout());
        return $this->theme->getFolder() . '/layouts/' . $layout . '/view.php';
    }

    /**
     * Return an array with for each block of this page the stored html & settings data.
     *
     * @return array|mixed
     */
    public function getPageBlocksData()
    {
        return $this->pageData['blocks'][$this->language] ?? [];
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
        $pageHtml = $this->shortcodeParser->doShortcodes($pageHtml, $this->language);

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
        if (isset($data['html'])) {
            $html .= $this->shortcodeParser->doShortcodes($data['html'], $this->language);
        }
        // include any style changes made via the page builder
        if (isset($data['css'])) {
            $html .= '<style>' . $data['css'] . '</style>';
        }

        return $html;
    }

    /**
     * Include a rendered theme block with the given slug, data instance id and data context.
     * This method is called on parsing shortcodes.
     *
     * @param $slug
     * @param null $id                  the id with which data for this block is stored
     * @param null $parentBlockId
     * @return string
     */
    public function renderBlock($slug, $id = null, $parentBlockId = null)
    {
        $themeBlock = new ThemeBlock($this->theme, $slug);

        $pageBlocksData = $this->pageBlocksData;
        $blockData = null;
        // get data for this block stored in the context of the parent block
        if (! is_null($parentBlockId) && isset($pageBlocksData[$parentBlockId]['blocks'][$id])) {
            $blockData = $pageBlocksData[$parentBlockId]['blocks'][$id];
        } elseif (isset($pageBlocksData[$id])) {
            // if no data is stored in context of the parent block, get data stored for this block's id
            $blockData = $pageBlocksData[$id];
        }

        $blockRenderer = new BlockRenderer($this->theme, $this->page, $this->forPageBuilder);
        return $blockRenderer->render($themeBlock, $blockData, $id ?? $themeBlock->getSlug());
    }

    /**
     * Parse the given shortcode to html.
     *
     * @param string $shortcode
     * @param array $data           the data for each block to be used wile parsing the shortcode
     * @return string
     * @throws Exception
     */
    public function parseShortcode(string $shortcode, $data = [])
    {
        $originalData = $this->pageBlocksData;

        // parse the shortcode with the data array passed as an argument to this method
        $this->pageBlocksData = $data;
        $html = $this->shortcodeParser->doShortcodes($shortcode, $this->language);

        $this->pageBlocksData = $originalData;
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
        $initialLanguage = $this->language;
        $languages = phpb_instance('setting')::get('languages') ?? [phpb_config('general.language')];

        // remove the already rendered blocks
        $this->shortcodeParser->resetRenderedBlocks();

        // trigger renderBody for each language to build up a structure of rendered versions of each block
        $dynamicBlocks = [];
        foreach ($languages as $language) {
            $this->setLanguage($language);
            $this->renderBody();
            $dynamicBlocks[$language] = $this->shortcodeParser->getRenderedBlocks()[$language] ?? [];
        }

        // revert to initial language
        $this->setLanguage($initialLanguage);

        // return the rendered html and settings for each dynamic block
        return $dynamicBlocks;
    }
}
