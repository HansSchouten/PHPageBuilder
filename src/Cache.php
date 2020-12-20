<?php

namespace PHPageBuilder;

use PHPageBuilder\Contracts\CacheContract;

class Cache implements CacheContract
{
    /**
     * Return the cached page for the given relative URL.
     *
     * @param $relativeUrl
     * @return string|null
     */
    public function getCachedUrl($relativeUrl)
    {
        $currentPageCacheFolder = phpb_config('cache.folder') . '/' . sha1(phpb_current_relative_url());
        if (is_dir($currentPageCacheFolder)) {
            return file_get_contents($currentPageCacheFolder . '/page.html');
        }

        return null;
    }
}
