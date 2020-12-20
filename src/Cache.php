<?php

namespace PHPageBuilder;

use PHPageBuilder\Contracts\CacheContract;

class Cache implements CacheContract
{
    /**
     * Return the cached page content for the given relative URL.
     *
     * @param string $relativeUrl
     * @return string|null
     */
    public function getForUrl(string $relativeUrl)
    {
        $currentPageCacheFolder = $this->getFolderForUrl($relativeUrl);
        if (is_dir($currentPageCacheFolder)) {
            return file_get_contents($currentPageCacheFolder . '/page.html');
        }

        return null;
    }

    /**
     * Store the given page content for the given relative URL.
     *
     * @param string $relativeUrl
     * @param string $pageContent
     */
    public function storeForUrl(string $relativeUrl, string $pageContent)
    {
        $currentPageCacheFolder = $this->getFolderForUrl($relativeUrl);
        if (! is_dir($currentPageCacheFolder)) {
            mkdir($currentPageCacheFolder, 0777, true);
        }

        file_put_contents($currentPageCacheFolder . '/page.html', $pageContent);
    }

    /**
     * Return the full cache storage folder path for the given relative URL.
     *
     * @param string $relativeUrl
     * @return string
     */
    public function getFolderForUrl(string $relativeUrl): string
    {
        return phpb_config('cache.folder') . '/' . sha1($relativeUrl);
    }
}
