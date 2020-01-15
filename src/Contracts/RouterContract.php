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

    /**
     * Return the full page instance based on the given matched route or page id.
     * (this method is helpful when extending a router to perform additional checks after a route has been matched)
     *
     * @param string $matchedRoute              the matched route
     * @param string|null $pageId               the page id of the matched route
     * @return PageContract|null
     */
    public function getMatchedPage(string $matchedRoute, $pageId = null);
}
