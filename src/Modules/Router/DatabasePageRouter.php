<?php

namespace PHPageBuilder\Modules\Router;

use PHPageBuilder\Contracts\PageContract;
use PHPageBuilder\Contracts\RouterContract;
use PHPageBuilder\Repositories\PageRepository;
use PHPageBuilder\Repositories\PageTranslationRepository;

class DatabasePageRouter implements RouterContract
{
    /**
     * @var PageRepository $pageRepository
     */
    protected $pageRepository;

    /**
     * @var PageTranslationRepository $pageTranslationRepository
     */
    protected $pageTranslationRepository;

    /**
     * @var array $routeParameters
     */
    protected $routeParameters;

    /**
     * @var array $routeToPageIdMapping
     */
    protected $routeToPageIdMapping;

    /**
     * DatabasePageRouter constructor.
     */
    public function __construct()
    {
        $this->pageRepository = new PageRepository;
        $this->pageTranslationRepository = new PageTranslationRepository;
        $this->routeParameters = [];
        $this->routeToPageIdMapping = [];
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

        // request all routes and convert each to its segments using / as separator
        $pageTranslations = $this->pageTranslationRepository->getAll(['page_id', 'route']);
        $routes = [];
        foreach ($pageTranslations as $pageTranslation) {
            $route = $pageTranslation['route'];
            $this->routeToPageIdMapping[$route] = $pageTranslation['page_id'];
            $routeSegments = explode('/', $route);
            $routes[] = $routeSegments;
        }

        // sort routes into the order for evaluation
        $orderedRoutes = $this->getRoutesInOrder($routes);

        // match each route with current URL segments and return the corresponding page once we find a match
        foreach ($orderedRoutes as $routeSegments) {
            if ($this->onRoute($urlSegments, $routeSegments)) {
                $fullRoute = implode('/', $routeSegments);
                $matchedPage = $this->getMatchedPage($fullRoute, $this->routeToPageIdMapping[$fullRoute]);

                if ($matchedPage) {
                    global $phpb_route_parameters;
                    $phpb_route_parameters = $this->routeParameters;

                    return $matchedPage;
                }
            }
        }

        return null;
    }

    /**
     * Sort the given routes into the order in which they need to be evaluated.
     *
     * @param $allRoutes
     * @return array
     */
    public function getRoutesInOrder($allRoutes)
    {
        usort($allRoutes, [$this, "routeOrderComparison"]);
        return $allRoutes;
    }

    /**
     * Compare two given routes and return -1,0,1 indicating which route should be evaluated first.
     *
     * @param $route1
     * @param $route2
     * @return int
     */
    public function routeOrderComparison($route1, $route2)
    {
        // routes with more segments should be evaluated first
        if (sizeof($route1) > sizeof($route2)) {
            return -1;
        }
        if (sizeof($route1) < sizeof($route2)) {
            return 1;
        }

        // routes ending with a  wildcard should be evaluated last (after exact matches or named parameters)
        if (array_slice($route1, -1)[0] === '*') {
            return 1;
        }
        if (array_slice($route2, -1)[0] === '*') {
            return -1;
        }

        // otherwise, the order is undetermined
        return 0;
    }

    /**
     * Return the full page instance based on the given matched route or page id.
     * (this method is helpful when extending a router to perform additional checks after a route has been matched)
     *
     * @param string $matchedRoute              the matched route
     * @param string $matchedPageId             the page id corresponding to the matched route
     * @return PageContract|null
     */
    public function getMatchedPage(string $matchedRoute, string $matchedPageId)
    {
        $page = $this->pageRepository->findWithId($matchedPageId);
        if ($page instanceof PageContract) {
            return $page;
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
            // the URL fully matches if the route segment is a wildcard
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
