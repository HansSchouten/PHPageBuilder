<?php

namespace PHPageBuilder\Modules\GrapesJS;

use PHPageBuilder\Contracts\PageBuilderContract;
use PHPageBuilder\Contracts\PageContract;
use PHPageBuilder\Contracts\ThemeContract;
use PHPageBuilder\Modules\GrapesJS\Upload\Uploader;
use PHPageBuilder\Repositories\PageRepository;
use PHPageBuilder\Repositories\UploadRepository;
use PHPageBuilder\Theme;
use Exception;

class PageBuilder implements PageBuilderContract
{
    /**
     * @var ThemeContract $theme
     */
    protected $theme;

    /**
     * PageBuilder constructor.
     */
    public function __construct()
    {
        $this->theme = new Theme(phpb_config('themes'), phpb_config('themes.active_theme'));
    }

    /**
     * Set the theme used while rendering pages in the page builder.
     *
     * @param ThemeContract $theme
     */
    public function setTheme(ThemeContract $theme)
    {
        $this->theme = $theme;
    }

    /**
     * Process the current GET or POST request and redirect or render the requested page.
     *
     * @param $route
     * @param $action
     * @return bool
     * @throws Exception
     */
    public function handleRequest($route, $action)
    {
        $pageId = $_GET['page'] ?? null;
        $pageRepository = new PageRepository;
        $page = $pageRepository->findWithId($pageId);

        if (! ($page instanceof PageContract)) {
            return false;
        }

        switch ($action) {
            case 'edit':
                $this->renderPageBuilder($page);
                exit();
                break;
            case 'store':
                if (isset($_POST) && isset($_POST['data'])) {
                    $data = json_decode($_POST['data'], true);
                    $this->updatePage($page, $data);
                    exit();
                }
                break;
            case 'upload':
                if (isset($_FILES)) {
                    $this->handleFileUpload();
                }
                break;
            case 'renderBlock':
                if (isset($_POST['data'])) {
                    $this->renderPageBuilderBlock($page, json_decode($_POST['data'], true));
                    exit();
                }
        }

        return false;
    }

    /**
     * Handle uploading of the posted file.
     *
     * @throws Exception
     */
    public function handleFileUpload()
    {
        $uploader = new Uploader('files');
        $uploader
            ->file_name(true)
            ->upload_to(phpb_config('storage.uploads_folder') . '/')
            ->run();

        if (! $uploader->was_uploaded) {
            die("Upload error: {$uploader->error}");
        } else {
            $originalFile = $uploader->file_src_name;
            $originalMime = $uploader->file_src_mime;
            $serverFile = $uploader->final_file_name;
            $publicId = explode('.', $serverFile)[0];

            $uploadRepository = new UploadRepository;
            $uploadedFile = $uploadRepository->create([
                'public_id' => $publicId,
                'original_file' => $originalFile,
                'mime_type' => $originalMime,
                'server_file' => $serverFile
            ]);

            echo json_encode([
                'data' => [
                    'src' => $uploadedFile->getUrl(),
                    'type' => 'image'
                ]
            ]);
            exit();
        }
    }

    /**
     * Render the PageBuilder for the given page.
     *
     * @param PageContract $page
     */
    public function renderPageBuilder(PageContract $page)
    {
        // init variables that should be accessible in the view
        $pageBuilder = $this;
        $pageRenderer = new PageRenderer($this->theme, $page, true);

        // create an array of theme block adapters, adapting each theme block to the representation for GrapesJS
        $blocks = [];
        foreach ($this->theme->getThemeBlocks() as $themeBlock) {
            $blocks[] = new BlockAdapter($pageRenderer, $themeBlock);
        }

        require __DIR__ . '/resources/views/layout.php';
    }

    /**
     * Render the given page.
     *
     * @param PageContract $page
     * @throws Exception
     */
    public function renderPage(PageContract $page)
    {
        $renderer = new PageRenderer($this->theme, $page);
        echo $renderer->render();
    }

    /**
     * Render in context of the given page, the given block with the passed settings, for updating the pagebuilder.
     *
     * @param PageContract $page
     * @param array $blockData
     * @throws Exception
     */
    public function renderPageBuilderBlock(PageContract $page, $blockData = [])
    {
        $blockData = is_array($blockData) ? $blockData : [];
        $renderer = new PageRenderer($this->theme, $page, true);
        echo $renderer->parseShortcode($blockData['html'], $blockData['blocks']);
    }

    /**
     * Update the given page with the given data (an array of html blocks)
     *
     * @param PageContract $page
     * @param $data
     * @return bool|object|null
     */
    public function updatePage(PageContract $page, $data)
    {
        $pageRepository = new PageRepository;
        return $pageRepository->updatePageData($page, $data);
    }

    /**
     * Return the list of all pages, used in CKEditor link editor.
     *
     * @return array
     */
    public function getPages()
    {
        $pages = [];

        $pageRepository = new PageRepository;
        foreach ($pageRepository->getAll() as $page) {
            $pages[] = [
                e($page->name),
                e($page->id)
            ];
        }

        return $pages;
    }

    /**
     * Return this page's components in the format passed to GrapesJS.
     *
     * @param PageContract $page
     * @return array
     */
    public function getPageComponents(PageContract $page)
    {
        $data = $page->getData();
        if (isset($data['components'])) {
            return $data['components'];
        }
        return [];
    }

    /**
     * Return this page's style in the format passed to GrapesJS.
     *
     * @param PageContract $page
     * @return array
     */
    public function getPageStyleComponents(PageContract $page)
    {
        $data = $page->getData();
        if (isset($data['style'])) {
            return $data['style'];
        }
        return [];
    }
}
