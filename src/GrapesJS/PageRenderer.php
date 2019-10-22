<?php

namespace PHPageBuilder\GrapesJS;

use PHPageBuilder\Contracts\PageContract;

class PageRenderer
{
    /**
     * @var PageContract $page
     */
    protected $page;

    /**
     * PageRenderer constructor.
     *
     * @param PageContract $page
     */
    public function __construct(PageContract $page)
    {
        $this->page = $page;
    }

    /**
     * Return the page passed to this PageRenderer instance.
     */
    public function render()
    {
       return '';
    }
}
