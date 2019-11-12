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

    /**
     * Return the URL of this page.
     */
    public function getUrl()
    {
        return phpb_url($this->route);
    }

    /**
     * Return the data stored for this page.
     */
    public function getData()
    {
        return json_decode($this->data, true);
    }
}
