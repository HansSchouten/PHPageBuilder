<?php

namespace PHPageBuilder;

use PHPageBuilder\Contracts\PageContract;
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

    /**
     * Return the page with the given id, or null.
     *
     * @param $id
     * @return PageContract|null
     */
    public function findWithId($id)
    {
        return Page::find($id);
    }
}
