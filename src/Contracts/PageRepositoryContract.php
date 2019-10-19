<?php

namespace PHPageBuilder\Contracts;

interface PageRepositoryContract
{
    /**
     * Return an array of all pages.
     *
     * @return array
     */
    public function getAll();
}
