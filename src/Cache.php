<?php

namespace PHPageBuilder;

use PHPageBuilder\Contracts\CacheContract;

class Cache implements CacheContract
{
    public static $maxCacheDepth = 6;
    public static $maxCachedPageVariants = 50;

    /**
     * Return the cached page content for the given relative URL.
     *
     * @param string $relativeUrl
     * @return string|null
     */
    public function getForUrl(string $relativeUrl)
    {
        $currentPageCacheFolder = $this->getPathForUrl($relativeUrl);
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
        $currentPageCacheFolder = $this->getPathForUrl($relativeUrl, true);
        if (! $this->cachePathCanBeUsed($currentPageCacheFolder)) {
            return;
        }

        $currentPageCacheFolder = $this->relativeToFullCachePath($currentPageCacheFolder);
        if (! is_dir($currentPageCacheFolder)) {
            mkdir($currentPageCacheFolder, 0777, true);
        }
        file_put_contents($currentPageCacheFolder . '/page.html', $pageContent);
    }

    /**
     * Return the cache storage path for the given relative URL.
     *
     * @param string $relativeUrl
     * @param bool $returnRelative
     * @return string
     */
    public function getPathForUrl(string $relativeUrl, bool $returnRelative = false): string
    {
        // use a cache path with folders based on the URL segments, to allow partial cache invalidation with a specific prefix
        $relativeUrlWithoutQueryString = explode('?', $relativeUrl)[0];
        $cachePath = phpb_slug($relativeUrlWithoutQueryString, true);

        // suffix the cache path with a hash of the exact relative URL, to prevent returning wrong content due to slug collisions
        $cachePath .= '/' . sha1($relativeUrl);

        return $returnRelative ? $cachePath : $this->relativeToFullCachePath($cachePath);
    }

    protected function relativeToFullCachePath(string $relativeCachePath): string
    {
        return phpb_config('cache.folder') . '/' . $relativeCachePath;
    }

    /**
     * Analyse the given cache path to determine whether it can be to used, without server/disk space issues.
     * This prevents deep nested cache paths and large numbers of cached pages per path due to query string variations.
     *
     * @param string $cachePath
     * @return bool
     */
    public function cachePathCanBeUsed(string $cachePath): bool
    {
        if (sizeof(explode('/', $cachePath)) > static::$maxCacheDepth) {
            return false;
        }

        $cachePathWithoutHash = dirname($this->relativeToFullCachePath($cachePath));
        $numberOfCachedPageVariants = count(glob("{$cachePathWithoutHash}/*", GLOB_ONLYDIR));
        if (is_dir($cachePathWithoutHash) && $numberOfCachedPageVariants >= static::$maxCachedPageVariants) {
            return false;
        }

        return true;
    }
}
