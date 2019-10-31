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
     * Return the rendered version of the page.
     *
     * @param bool $forPageBuilder
     * @return string
     * @throws Exception
     */
    public function render($forPageBuilder = false)
    {
        $layoutFile = $this->getPageLayoutPath();

        // init variables that should be accessible in the view
        $renderer = $this;
        if ($this->forPageBuilder) {
            $body = '<div phpb-content-container="true" style="min-height: 100px; width: 100%;"></div>';
        } else {
            $body = $this->renderBody();
        }

        ob_start();
        require $layoutFile;
        $pageBuilderPageContent = ob_get_contents();
        ob_end_clean();

        return $pageBuilderPageContent;
    }

    /**
     * Include a rendered theme block with the given id.
     * Note: this method is called from php blocks or layout files to include other blocks.
     *
     * @param $id
     * @return false|string
     */
    public function block($id)
    {
        $output = '';
        $renderer = $this;
        $themeBlock = new ThemeBlock($this->theme, $id);

        ob_start();
        require $themeBlock->getViewFile();
        $html = ob_get_contents();
        ob_end_clean();

        if ($this->forPageBuilder) {
            $html = '<phpb-block id="' . $themeBlock->getId() . '" is-html="' . ($themeBlock->isHtmlBlock() ? 'true' : 'false') . '">'
                . $html
                . '</phpb-block>';
        }

        return $html;
    }

    /**
     * Render the given theme block with blockViewFunctions to be used as a block in GrapesJS.
     *
     * @param ThemeBlock $themeBlock
     * @param $blockViewFunctions
     * @return string
     * @throws Exception
     */
    public function getGrapesJSBlockHtml(ThemeBlock $themeBlock, $blockViewFunctions)
    {
        if ($themeBlock->isHtmlBlock()) {
            $html = file_get_contents($themeBlock->getFolder() . '/view.html');
        } else {
            // init variables that should be accessible in the view
            $block = $blockViewFunctions;

            ob_start();
            require $themeBlock->getFolder() . '/view.php';
            $html = ob_get_contents();
            ob_end_clean();
        }

        $shortcodeParser = new ShortcodeParser($this);
        $html = $shortcodeParser->doShortcodes($html);

        $html = '<phpb-block id="' . $themeBlock->getId() . '" is-html="' . ($themeBlock->isHtmlBlock() ? 'true' : 'false') . '">'
            . $html
            . '</phpb-block>';

        return $html;
    }

    /**
     * Return the page body for display on the website.
     * The body contains all blocks which is put into the selected layout.
     *
     * @return string
     * @throws Exception
     */
    public function renderBody()
    {
        $html = '';
        $shortcodeParser = new ShortcodeParser($this);

        $data = json_decode($this->page->data);
        if (isset($data->html)) {
            $html .= $shortcodeParser->doShortcodes($data->html);
        }
        if (isset($data->css)) {
            $html .= '<style>' . $data->css . '</style>';
        }

        return $html;
    }

    /**
     * Return this page's components in the format passed to GrapesJS.
     */
    public function getPageComponents()
    {
        $data = json_decode($this->page->data);
        if (isset($data->components)) {
            return $data->components;
        }
        return '[]';
    }

    /**
     * Return this page's style in the format passed to GrapesJS.
     */
    public function getPageStyleComponents()
    {
        $data = json_decode($this->page->data);
        if (isset($data->style)) {
            return $data->style;
        }
        return '[]';
    }
}
