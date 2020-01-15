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
     * @var array $routeParameters
     */
    protected $routeParameters;

    /**
     * DatabasePageRouter constructor.
     */
    public function __construct()
    {
        $this->pageRepository = new PageRepository;
        $this->routeParameters = [];
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
                global $phpb_route_parameters;
                $phpb_route_parameters = $this->routeParameters;

                // return page that corresponds with the matched route
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
        $routeParameters = [];

        // try matching each route segment with the same level URL segment
        foreach ($routeSegments as $i => $routeSegment) {
            if (! isset($urlSegments[$i])) {
                return false;
            }
            $urlSegment = $urlSegments[$i];

            // the URL segment matches if the route segment is a {parameter}
            if (substr($routeSegment,0, 1) === '{' && substr($routeSegment, -1) === '}') {
                $parameter = trim($routeSegment, '{}');
                $routeParameters[$parameter] = $urlSegment;
                continue;
            }
            // the URL fully matches if the route segment is a wild character
            if ($routeSegment === '*') {
                break;
            }
            // the URL segment matches if equal to the route segment
            if ($urlSegment === $routeSegment) {
                continue;
            }

            // the URL segment and route segment did not match
            return false;
        }

        $this->routeParameters = $routeParameters;
        return true;
    }
}
