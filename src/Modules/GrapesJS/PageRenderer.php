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
        return $this->theme->getFolder() . '/layouts/' . basename($this->page->layout) . '/view.php';
    }

    /**
     * Return the page passed to this PageRenderer instance.
     */
    public function render()
    {
        $layoutFile = $this->getPageLayoutPath();

        // init variables that should be accessible in the view
        $renderer = $this;
        $body = $this->renderBody();

        ob_start();
        require $layoutFile;
        $pageBuilderPageContent = ob_get_contents();
        ob_end_clean();

        return $pageBuilderPageContent;
    }

    /**
     * Return the page body (containing all blocks) which is put into the selected layout.
     *
     * @return string
     */
    public function renderBody()
    {
        return '';
    }
}
