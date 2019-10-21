<?php

namespace PHPageBuilder\WebsiteManager;

use PHPageBuilder\Contracts\WebsiteManagerContract;
use PHPageBuilder\PageRepository;

class WebsiteManager implements WebsiteManagerContract
{
    /**
     * Process the current GET or POST request and redirect or render the requested page.
     *
     * @param $route
     * @param $action
     */
    public function handleRequest($route, $action)
    {
        if (is_null($route)) {
            $this->renderOverview();
            exit();
        }
    }

    /**
     * Render the website manager overview page.
     */
    public function renderOverview()
    {
        $pageRepository = new PageRepository;
        $pages = $pageRepository->getAll();

        $page = 'overview';
        require __DIR__ . '/resources/views/layout.php';
    }

    /**
     * Render the website manager page settings (add/edit page form).
     */
    public function renderPageSettings()
    {
        $page = 'page-settings';
        require __DIR__ . '/resources/views/layout.php';
    }

    /**
     * Render the website manager menu settings (add/edit menu form).
     */
    public function renderMenuSettings()
    {
        $page = 'menu-settings';
        require __DIR__ . '/resources/views/layout.php';
    }
}
