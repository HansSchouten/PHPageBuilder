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
     * Return the page from database corresponding to the given URL.
     *
     * @param $url
     * @return PageContract|null
     */
    public function resolve($url)
    {
        // strip URL query parameters
        $url = explode('?', $url, 2)[0];
        // split URL into segments using / as separator
        $urlSegments = explode('/', $url);

        // request all routes and match with current URL segments
        $pages = $this->pageRepository->getAll(['id', 'route']);
        foreach ($pages as $page) {
            $routeSegments = explode('/', $page->route);

            if ($this->onRoute($urlSegments, $routeSegments)) {
                return $this->pageRepository->findWithId($page->id);
            }
        }

        return null;
    }

    /**
     * Return whether the given URL segments match with the given route segments.
     *
     * @param $urlSegments
     * @param $routeSegments
     * @return bool
     */
    protected function onRoute($urlSegments, $routeSegments)
    {
        foreach ($routeSegments as $i => $routeSegment) {
            if (! isset($urlSegments[$i])) {
                return false;
            }

            $segment = $urlSegments[$i];
            if ($segment === $routeSegment) {
                continue;
            }
            if ($routeSegment === '*') {
                break;
            }

            return false;
        }

        return true;
    }
}
