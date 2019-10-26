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
}
