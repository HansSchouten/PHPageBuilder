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

        if ($route === 'page_settings') {
            if ($action === 'create') {
                $this->renderPageSettings($action);
                exit();
            }

            if (isset($_GET['page'])) {
                $pageId = $_GET['page'];
                $pageRepository = new PageRepository;
                $page = $pageRepository->findWithId($pageId);
                if (! $page) {
                    return;
                }

                if ($action === 'edit') {

                } else if ($action === 'destroy') {

                }
            }
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
     *
     * @param string $action
     */
    public function renderPageSettings(string $action)
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
