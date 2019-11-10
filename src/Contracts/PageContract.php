<?php

namespace PHPageBuilder\Contracts;

interface PageContract
{
    /**
     * Return the layout (file name) of this page.
     *
     * @return string
     */
    public function getLayout();

    /**
     * Return the URL of this page.
     */
    public function getUrl();

    /**
     * Return the data stored for this page.
     */
    public function getData();
}
