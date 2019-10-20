<?php

namespace PHPageBuilder;

use Illuminate\Database\Capsule\Manager as Capsule;
use PHPageBuilder\Contracts\LoginContract;
use PHPageBuilder\Contracts\WebsiteManagerContract;
use PHPageBuilder\Contracts\PageBuilderContract;
use PHPageBuilder\Contracts\RouterContract;
use PHPageBuilder\Contracts\ThemeContract;
use PHPageBuilder\Login\Login;
use PHPageBuilder\WebsiteManager\WebsiteManager;
use PHPageBuilder\GrapesJS\PageBuilder;
use PHPageBuilder\Router\DatabasePageRouter;

class PHPageBuilder
{
    /**
     * @var array $config
     */
    protected $config;

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
     * @param array $config         configuration in the format defined in config/pagebuilder.example.php
     * @param string|null $themeSlug
     * @param string $language
     */
    public function __construct(array $config, string $themeSlug = null, string $language = 'en')
    {
        session_start();

        $this->config = $config;

        if (isset($themeSlug)) {
            $this->theme = new Theme($this, $config['themes'], $themeSlug);
        }

        // init the default login, if enabled
        if ($config['login']['use_login']) {
            $this->login = new Login;
        }

        // init the default website manager, if enabled
        if ($config['website_manager']['use_website_manager']) {
            $this->websiteManager = new WebsiteManager;
        }

        // init the default page builder and page router
        $this->pageBuilder = new PageBuilder;
        $this->router = new DatabasePageRouter;

        // load translations of the configured language
        $this->loadTranslations($language);

        // create database connection and boot eloquent models on classes extending Eloquent\Model
        if ($config['storage']['use_database']) {
            $capsule = new Capsule;
            $capsule->addConnection($config['storage']['database']);
            $capsule->setAsGlobal();
            $capsule->bootEloquent();
        }
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

        if ($this->config['login']['use_login']) {
            $this->login->handleRequest($route, $action);
        }
        if ($this->config['website_manager']['use_website_manager']) {
            $this->websiteManager->handleRequest($route, $action);
        }
        $this->pageBuilder->handleRequest($route, $action);
    }


    /**
     * Render the PageBuilder.
     */
    public function renderPageBuilder()
    {
        $this->pageBuilder->renderPageBuilder();
    }

    /**
     * Render the page of the given URI.
     *
     * @param string $URI
     */
    public function renderPage(string $URI)
    {
        $page = $this->router->resolve($URI);
    }

    /**
     * Render the block identified with the given block slug.
     *
     * @param string $blockSlug
     */
    public function renderBlock(string $blockSlug)
    {
        $this->theme->renderBlock($blockSlug);
    }
}
