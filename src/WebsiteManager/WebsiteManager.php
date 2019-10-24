<?php

namespace PHPageBuilder\WebsiteManager;

use PHPageBuilder\Contracts\PageContract;
use PHPageBuilder\Contracts\WebsiteManagerContract;
use PHPageBuilder\Repositories\PageRepository;
use PHPageBuilder\Theme;

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
            $this->handleOverview();
        }

        if ($route === 'page_settings') {
            if ($action === 'create') {
                $this->handleCreate();
            }

            $pageId = isset($_GET['page']) ? $_GET['page'] : null;
            $pageRepository = new PageRepository;
            $page = $pageRepository->findWithId($pageId);
            if (is_null($page)) {
                phpb_redirect('');
            }

            if ($action === 'edit') {
                $this->handleEdit($page);
            } else if ($action === 'destroy') {
                $this->handleDestroy($page);
            }
        }
    }

    public function handleOverview()
    {
        $this->renderOverview();
        exit();
    }

    public function handleCreate()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $pageRepository = new PageRepository;
            $page = $pageRepository->create($_POST);
            if ($page) {
                phpb_redirect('');
            }
        }

        $this->renderPageSettings('create');
        exit();
    }

    public function handleEdit(PageContract $page)
    {
    }

    public function handleDestroy(PageContract $page)
    {
        $pageRepository = new PageRepository;
        if ($pageRepository->destroy($page->id)) {
            echo 'success :)';
        }
        echo 'not succeeded :(';
        exit();
        phpb_redirect('');
    }

    /**
     * Render the website manager overview page.
     */
    public function renderOverview()
    {
        $pageRepository = new PageRepository;
        $pages = $pageRepository->getAll();

        $page = 'overview';
        require __DIR__ . '/resources/layouts/master.php';
    }

    /**
     * Render the website manager page settings (add/edit page form).
     *
     * @param string $action
     */
    public function renderPageSettings(string $action)
    {
        $theme = new Theme(phpb_config('themes'), phpb_config('themes.active_theme'));

        $page = 'page-settings';
        require __DIR__ . '/resources/layouts/master.php';
    }

    /**
     * Render the website manager menu settings (add/edit menu form).
     */
    public function renderMenuSettings()
    {
        $page = 'menu-settings';
        require __DIR__ . '/resources/layouts/master.php';
    }
}
