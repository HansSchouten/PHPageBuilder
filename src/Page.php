<?php

namespace PHPageBuilder;

use PHPageBuilder\Contracts\PageContract;

class Page implements PageContract
{
    /**
     * Return the layout (file name) of this page.
     *
     * @return string
     */
    public function getLayout()
    {
        return $this->layout;
    }
}
