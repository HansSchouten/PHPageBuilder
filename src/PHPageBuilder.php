<?php

namespace PHPageBuilder;

use PHPageBuilder\Contracts\AuthContract;
use PHPageBuilder\Contracts\PageContract;
use PHPageBuilder\Contracts\PageTranslationContract;
use PHPageBuilder\Contracts\WebsiteManagerContract;
use PHPageBuilder\Contracts\PageBuilderContract;
use PHPageBuilder\Contracts\RouterContract;
use PHPageBuilder\Contracts\ThemeContract;
use PHPageBuilder\Repositories\UploadRepository;
use PHPageBuilder\Core\DB;

class PHPageBuilder
{
    /**
     * @var AuthContract $auth
     */
    protected $auth;

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
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

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

        // init the default authentication, if enabled
        if (phpb_config('auth.use_login')) {
            $this->auth = phpb_instance('auth');
        }

        // init the default website manager, if enabled
        if (phpb_config('website_manager.use_website_manager')) {
            $this->websiteManager = phpb_instance('website_manager');
        }

        // init the default page builder, active theme and page router
        $this->pageBuilder = phpb_instance('pagebuilder');
        $this->theme = phpb_instance('theme', [phpb_config('theme'), phpb_config('theme.active_theme')]);
        $this->router = phpb_instance('router');

        // load translations of the configured language
        $this->loadTranslations(phpb_config('general.language'));
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
     * Set a custom auth.
     *
     * @param AuthContract $auth
     */
    public function setAuth(AuthContract $auth)
    {
        $this->auth = $auth;
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
     * Return the Auth instance of this PHPageBuilder.
     *
     * @return AuthContract
     */
    public function getAuth()
    {
        return $this->auth;
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
     *
     * @param string|null $action
     * @return bool
     */
    public function handleRequest($action = null)
    {
        $route = $route ?? $_GET['route'] ?? null;
        $action = $action ?? $_GET['action'] ?? null;

        if (! phpb_config('auth.use_login') || ! phpb_config('website_manager.use_website_manager')) {
            die('Authentication is disabled, use handlePublicRequest() and handleAuthenticatedRequest()');
        }

        // handle login and logout requests
        $this->auth->handleRequest($action);

        // handle website manager requests
        if (phpb_in_module('website_manager')) {
            $this->auth->requireAuth();
            $this->websiteManager->handleRequest($route, $action);
            die('Page not found');
        }

        // handle page builder requests
        if (phpb_in_module('pagebuilder')) {
            $this->auth->requireAuth();
            phpb_set_in_editmode();
            $this->pageBuilder->handleRequest($route, $action);
            die('Page not found');
        }

        // handle all requests that do not need authentication
        if ($this->handlePublicRequest()) {
            return true;
        }

        die('Page not found');
    }

    /**
     * Handle public requests, allowed without any authentication.
     *
     * @return bool
     */
    public function handlePublicRequest()
    {
        // if we are on the URL of an upload, return uploaded file
        if (strpos(phpb_current_url(), phpb_config('general.uploads_url') . '/') === 0) {
            $this->handleUploadedFileRequest();
            die('File not found');
        }
        // if we are on the URL of a PHPageBuilder asset, return the asset
        if (strpos(phpb_current_url(), phpb_config('general.assets_url') . '/') === 0) {
            $this->handlePageBuilderAssetRequest();
            die('Asset not found');
        }

        // let the page router resolve the current URL
        $pageTranslation = $this->router->resolve(phpb_current_url());
        if ($pageTranslation instanceof PageTranslationContract) {
            $page = $pageTranslation->getPage();
            $this->pageBuilder->renderPage($page, $pageTranslation->locale);
            return true;
        }
        return false;
    }

    /**
     * Handle authenticated requests, this method assumes you have checked that the user is currently logged in.
     *
     * @param string|null $route
     * @param string|null $action
     */
    public function handleAuthenticatedRequest($route = null, $action = null)
    {
        $route = $route ?? $_GET['route'] ?? null;
        $action = $action ?? $_GET['action'] ?? null;

        // handle website manager requests
        if (phpb_config('website_manager.use_website_manager') && phpb_in_module('website_manager')) {
            $this->websiteManager->handleRequest($route, $action);
            die('Page not found');
        }

        // handle page builder requests
        if (phpb_in_module('pagebuilder')) {
            phpb_set_in_editmode();
            $this->pageBuilder->handleRequest($route, $action);
            die('Page not found');
        }
    }

    /**
     * Handle uploaded file requests.
     */
    public function handleUploadedFileRequest()
    {
        // get the requested file by stripping the configured uploads_url prefix from the current request URI
        $file = substr(phpb_current_url(), strlen(phpb_config('general.uploads_url')) + 1);
        // $file is in the format {file id}/{file name}.{file extension}, so get file id as the part before /
        $fileId = explode('/', $file)[0];
        if (empty($fileId)) die('File not found');

        $uploadRepository = new UploadRepository;
        $uploadedFile = $uploadRepository->findWhere('public_id', $fileId);
        if (! $uploadedFile) die('File not found');

        $uploadedFile = $uploadedFile[0];
        $serverFile = realpath(phpb_config('storage.uploads_folder') . '/' . basename($uploadedFile->server_file));
        if (! $serverFile) die('File not found');

        header('Content-Type: ' . $uploadedFile->mime_type);
        header('Content-Disposition: inline; filename="' . basename($uploadedFile->original_file) . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Content-Length: ' . filesize($serverFile));

        readfile($serverFile);
        exit();
    }

    /**
     * Handle page builder asset requests.
     */
    public function handlePageBuilderAssetRequest()
    {
        // get asset file path by stripping the configured assets_url prefix from the current request URI
        $asset = substr(phpb_current_url(), strlen(phpb_config('general.assets_url')) + 1);

        $distPath = realpath(__DIR__ . '/../dist/');
        $requestedFile = realpath($distPath . '/' . $asset);
        if (! $requestedFile) die('Asset not found');

        // prevent path traversal by ensuring the requested file is inside the dist folder
        if (strpos($requestedFile, $distPath) !== 0) die('Asset not found');

        // only allow specific extensions
        $ext = pathinfo($requestedFile, PATHINFO_EXTENSION);
        if (! in_array($ext, ['js', 'css', 'png'])) die('Asset not found');

        header('Content-Type: text/' . $ext);
        header('Content-Disposition: inline; filename="' . basename($requestedFile) . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Content-Length: ' . filesize($requestedFile));

        readfile($requestedFile);
        exit();
    }


    /**
     * Render the PageBuilder.
     *
     * @param PageContract $page
     */
    public function renderPageBuilder(PageContract $page)
    {
        phpb_set_in_editmode();
        $this->pageBuilder->renderPageBuilder($page);
    }
}
