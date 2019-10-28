<?php

namespace PHPageBuilder\Modules\Router;

use PHPageBuilder\Contracts\PageContract;
use PHPageBuilder\Contracts\RouterContract;
use PHPageBuilder\Repositories\PageRepository;

class DatabasePageRouter implements RouterContract
{
    /**
     * @var PageRepository $pageRepository
     */
    protected $pageRepository;

    /**
     * DatabasePageRouter constructor.
     */
    public function __construct()
    {
        $this->pageRepository = new PageRepository;
    }

    /**
     * Return the page from database corresponding to the given route.
     *
     * @param $route
     * @return PageContract|null
     */
    public function resolve($route)
    {
        $page = $this->attempt($route);
        if ($page) return $page;

        // asterisk will be used as wildcard character, so remove all asterisks
        $route = str_replace('*', '', $route);

        // repeat until we are at the empty URL
        while ($route !== '/*') {
            $route = str_replace('/*', '', $route);

            // replace /blog/this-is-a-post with /blog/*
            $lastSlash = strrpos($route,"/");
            $route = substr($route, 0, $lastSlash) . '/*';

            // try to find the route with wildcard
            $page = $this->attempt($route);
            if ($page) return $page;
        }

        return null;
    }

    /**
     * Attempt to resolve the given route into a Page.
     *
     * @param $route
     * @return PageContract|null
     */
    protected function attempt($route)
    {
        $pages = $this->pageRepository->findWhere('route', $route);

        if (empty($pages)) {
            return null;
        }
        return $pages[0];
    }
}
