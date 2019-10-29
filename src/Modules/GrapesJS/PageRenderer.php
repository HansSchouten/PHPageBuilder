<?php

namespace PHPageBuilder\Modules\GrapesJS;

use PHPageBuilder\Contracts\PageContract;
use PHPageBuilder\Theme;
use PHPageBuilder\ThemeBlock;

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
     * PageRenderer constructor.
     *
     * @param Theme $theme
     * @param PageContract $page
     */
    public function __construct(Theme $theme, PageContract $page)
    {
        $this->theme = $theme;
        $this->page = $page;
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
     * Return the rendered version of the page for being displayed in the page builder.
     *
     * @return string
     */
    public function renderForPageBuilder()
    {
        return $this->render(true);
    }

    /**
     * Return the rendered version of the page.
     *
     * @param bool $forPageBuilder
     * @return string
     */
    public function render($forPageBuilder = false)
    {
        $layoutFile = $this->getPageLayoutPath();

        // init variables that should be accessible in the view
        $renderer = $this;
        if ($forPageBuilder) {
            $body = $this->renderBodyForPageBuilder();
        } else {
            $body = $this->renderBody();
        }

        ob_start();
        require $layoutFile;
        $pageBuilderPageContent = ob_get_contents();
        ob_end_clean();

        return $pageBuilderPageContent;
    }

    public function block($slug)
    {
        $output = '';
        $block = new ThemeBlock($this->theme, $slug);

        ob_start();
        require $block->getViewFile();
        $output = ob_get_contents();
        ob_end_clean();

        return $output;
    }

    /**
     * Return the page body for display on the website.
     * The body contains all blocks which is put into the selected layout.
     *
     * @return string
     */
    public function renderBody()
    {
        $html = '';

        $data = json_decode($this->page->data);
        if (isset($data->html)) {
            $html .= $data->html;
        }
        if (isset($data->css)) {
            $html .= '<style>' . $data->css . '</style>';
        }

        return $html;
    }

    /**
     * Return the page body for display inside the page builder.
     * The body contains all blocks which is put into the selected layout.
     *
     * @return string
     */
    public function renderBodyForPageBuilder()
    {
        $html = '<div phpb-content-container="true" style="min-height: 100px; width: 100%;"></div>';

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
