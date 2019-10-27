<?php

namespace PHPageBuilder\Modules\Router;

use PHPageBuilder\Contracts\PageContract;
use PHPageBuilder\Contracts\RouterContract;
use PHPageBuilder\Repositories\PageRepository;

class DatabasePageRouter implements RouterContract
{
    /**
     * Return the page from database corresponding to the given route.
     *
     * @param $route
     * @return PageContract|null
     */
    public function resolve($route)
    {
        $pageRepository = new PageRepository;
        $pages = $pageRepository->findWhere('route', $route);

        if (empty($pages)) {
            return null;
        }
        return $pages[0];
    }
}
