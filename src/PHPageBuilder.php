<?php

namespace PHPageBuilder;

use PHPageBuilder\Contracts\LoginContract;
use PHPageBuilder\Contracts\PageContract;
use PHPageBuilder\Contracts\WebsiteManagerContract;
use PHPageBuilder\Contracts\PageBuilderContract;
use PHPageBuilder\Contracts\RouterContract;
use PHPageBuilder\Contracts\ThemeContract;
use PHPageBuilder\Core\DB;

class PHPageBuilder
{
    /**
     * @var LoginContract $login
     */
    protected $login;

    /**
     * @var WebsiteManagerContract $websiteManager
     */
    protected $websiteManager;

    /**
     * @var PageBuilderContract $pageBuilder
     */
    protected $pageBuilder;

    /**
     * @var RouterContract $router
     */
    protected $router;

    /**
     * @var ThemeContract $theme
     */
    protected $theme;

    /**
     * PHPageBuilder constructor.
     *
     * @param array $config         configuration in the format defined in config/config.example.php
     */
    public function __construct(array $config)
    {
        session_start();

        // if flash session data is set, set global session flash data and remove data
        if (isset($_SESSION['phpb_flash'])) {
            global $phpb_flash;
            $phpb_flash = $_SESSION['phpb_flash'];
            unset($_SESSION['phpb_flash']);
        }

        $this->setConfig($config);

        // create database connection, if enabled
        if (phpb_config('storage.use_database')) {
            $this->setDatabaseConnection(phpb_config('storage.database'));
        }

        // init the default login, if enabled
        if (phpb_config('login.use_login')) {
            $this->login = phpb_instance('login');
        }

        // init the default website manager, if enabled
        if (phpb_config('website_manager.use_website_manager')) {
            $this->websiteManager = phpb_instance('website_manager');
        }

        // init the default page builder, active theme and page router
        $this->pageBuilder = phpb_instance('pagebuilder');
        $this->theme = new Theme(phpb_config('themes'), phpb_config('themes.active_theme'));
        $this->router = phpb_instance('router');

        // load translations of the configured language
        $this->loadTranslations(phpb_config('project.language'));
    }

    /**
     * Load translations of the given language into a global variable.
     *
     * @param $language
     */
    public function loadTranslations($language)
    {
        global $phpb_translations;
        $phpb_translations = require __DIR__ . '/../lang/' . $language . '.php';
    }


    /**
     * Set the PHPageBuilder configuration to the given array.
     *
     * @param array $config
     */
    public function setConfig(array $config)
    {
        global $phpb_config;
        $phpb_config = $config;
    }

    /**
     * Set the PHPageBuilder database connection using the given array.
     *
     * @param array $config
     */
    public function setDatabaseConnection(array $config)
    {
        global $phpb_db;
        $phpb_db = new DB($config);
    }

    /**
     * Set a custom login.
     *
     * @param LoginContract $login
     */
    public function setLogin(LoginContract $login)
    {
        $this->login = $login;
    }

    /**
     * Set a custom website manager.
     *
     * @param WebsiteManagerContract $websiteManager
     */
    public function setWebsiteManager(WebsiteManagerContract $websiteManager)
    {
        $this->websiteManager = $websiteManager;
    }

    /**
     * Set a custom PageBuilder.
     *
     * @param PageBuilderContract $pageBuilder
     */
    public function setPageBuilder(PageBuilderContract $pageBuilder)
    {
        $this->pageBuilder = $pageBuilder;
    }

    /**
     * Set a custom router.
     *
     * @param RouterContract $router
     */
    public function setRouter(RouterContract $router)
    {
        $this->router = $router;
    }

    /**
     * Set a custom theme.
     *
     * @param ThemeContract $theme
     */
    public function setTheme(ThemeContract $theme)
    {
        $this->theme = $theme;
        if (isset($this->pageBuilder)) {
            $this->pageBuilder->setTheme($theme);
        }
    }


    /**
     * Return the Login instance of this PHPageBuilder.
     *
     * @return LoginContract
     */
    public function getLogin()
    {
        return $this->login;
    }

    /**
     * Return the WebsiteManager instance of this PHPageBuilder.
     *
     * @return WebsiteManagerContract
     */
    public function getWebsiteManager()
    {
        return $this->websiteManager;
    }

    /**
     * Return the PageBuilder instance of this PHPageBuilder.
     *
     * @return PageBuilderContract
     */
    public function getPageBuilder()
    {
        return $this->pageBuilder;
    }

    /**
     * Return the Router instance of this PHPageBuilder.
     *
     * @return RouterContract
     */
    public function getRouter()
    {
        return $this->router;
    }

    /**
     * Return the Theme instance of this PHPageBuilder.
     *
     * @return ThemeContract
     */
    public function getTheme()
    {
        return $this->theme;
    }


    /**
     * Process the current GET or POST request and redirect or render the requested page.
     */
    public function handleRequest()
    {
        $route = isset($_GET['route']) ? $_GET['route'] : null;
        $action = isset($_GET['action']) ? $_GET['action'] : null;

        // if we are at the backend, handle login, website manager and page builder requests
        if (strpos($_SERVER['REQUEST_URI'], phpb_config('project.pagebuilder_url')) === 0) {
            if (phpb_config('login.use_login')) {
                $this->login->handleRequest($route, $action);
            }
            if (phpb_config('website_manager.use_website_manager')) {
                $this->websiteManager->handleRequest($route, $action);
            }
            $this->pageBuilder->handleRequest($route, $action);
        }

        // return assets
        $this->handleAssetRequest();

        // let the page router resolve the current URL
        $page = $this->router->resolve($_SERVER['REQUEST_URI']);
        if ($page instanceof PageContract) {
            $this->pageBuilder->renderPage($page);
            exit();
        }

        die('Page not found');
    }

    /**
     * Handle asset requests.
     */
    public function handleAssetRequest()
    {
        $asset = isset($_GET['asset']) ? $_GET['asset'] : null;
        if ($asset && is_string($asset)) {
            $distPath = realpath(__DIR__ . '/../dist/');
            $requestedFile = realpath($distPath . '/' . $asset);
            if (! $requestedFile) die('Asset not found');

            // prevent path traversal by ensuring the requested file is inside the dist folder
            if (strpos($requestedFile, $distPath) !== 0) die('Asset not found');

            // only allow specific extensions
            $ext = pathinfo($requestedFile, PATHINFO_EXTENSION);
            if (! in_array($ext, ['js', 'css'])) die('Asset not found');

            header('Content-Type: text/' . $ext);
            header('Content-Disposition: inline; filename="' . basename($requestedFile) . '"');
            header('Expires: 0');
            header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
            header('Content-Length: ' . filesize($requestedFile));

            readfile($requestedFile);
            exit();
        }
    }


    /**
     * Render the PageBuilder.
     *
     * @param PageContract $page
     */
    public function renderPageBuilder(PageContract $page)
    {
        $this->pageBuilder->renderPageBuilder($page);
    }
}
