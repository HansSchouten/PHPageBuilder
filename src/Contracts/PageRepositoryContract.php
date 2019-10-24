<?php

namespace PHPageBuilder\Contracts;

interface PageRepositoryContract
{
    /**
     * Create a new page.
     *
     * @param array $data
     * @return bool|object
     */
    public function create(array $data);

    /**
     * Return an array of all pages.
     *
     * @return array
     */
    public function getAll();
}
