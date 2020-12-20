<?php

namespace PHPageBuilder\Contracts;

interface CacheContract
{
    /**
     * Return the cached page for the given relative URL.
     *
     * @param $relativeUrl
     * @return string|null
     */
    public function getCachedUrl($relativeUrl);
}
