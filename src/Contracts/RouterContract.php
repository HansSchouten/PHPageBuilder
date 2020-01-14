<?php

namespace PHPageBuilder\Contracts;

interface RouterContract
{
    /**
     * Return the page corresponding to the given URL.
     *
     * @param $url
     * @return PageContract|null
     */
    public function resolve($url);
}
