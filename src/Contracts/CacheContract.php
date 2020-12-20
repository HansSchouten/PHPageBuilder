<?php

namespace PHPageBuilder\Contracts;

interface CacheContract
{
    /**
     * Return the cached page content for the given relative URL.
     *
     * @param string $relativeUrl
     * @return string|null
     */
    public function getForUrl(string $relativeUrl);

    /**
     * Store the given page content for the given relative URL.
     *
     * @param string $relativeUrl
     * @param string $pageContent
     */
    public function storeForUrl(string $relativeUrl, string $pageContent);

    /**
     * Return the full cache storage folder path for the given relative URL.
     *
     * @param string $relativeUrl
     * @return string
     */
    public function getFolderForUrl(string $relativeUrl): string;
}
