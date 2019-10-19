<?php

namespace PHPageBuilder;

use PHPageBuilder\Contracts\PageRepositoryContract;

class PageRepository implements PageRepositoryContract
{
    /**
     * Return an array of all pages.
     *
     * @return array
     */
    public function getAll()
    {
        return Page::all();
    }
}
