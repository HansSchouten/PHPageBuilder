<?php

namespace PHPageBuilder\Modules\GrapesJS;

use PHPageBuilder\Contracts\PageContract;
use PHPageBuilder\Theme;

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
            $body = $this->renderPageBuilderBody();
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
     * Return the page body for display on the website.
     * The body contains all blocks which is put into the selected layout.
     *
     * @return string
     */
    public function renderBody()
    {
        $html = '';

        $blocks = json_decode($this->page->data);
        foreach ($blocks as $blockHtml) {
            $html .= $blockHtml;
        }

        return $html;
    }

    /**
     * Return the page body for display inside the page builder.
     * The body contains all blocks which is put into the selected layout.
     *
     * @return string
     */
    public function renderPageBuilderBody()
    {
        $html = '<div phpb-content-container="true" style="min-height: 100px; width: 100%;">';

        $blocks = json_decode($this->page->data);
        foreach ($blocks as $blockHtml) {
            $html .= $blockHtml;
        }

        $html .= '</div>';

        return $html;
    }
}
