<?php

namespace PHPageBuilder\Modules\GrapesJS\Block;

use PHPageBuilder\Contracts\PageContract;
use PHPageBuilder\ThemeBlock;

class BlockRenderer
{
    /**
     * @var PageContract $page
     */
    protected $page;

    /**
     * @var bool $forPageBuilder
     */
    protected $forPageBuilder;

    /**
     * BlockAdapter constructor.
     *
     * @param PageContract $page
     * @param bool $forPageBuilder
     */
    public function __construct(PageContract $page, $forPageBuilder)
    {
        $this->page = $page;
        $this->forPageBuilder = $forPageBuilder;
    }

    /**
     * Render the given theme block with the given stored block data.
     *
     * @param ThemeBlock $themeBlock
     * @param $blockData
     * @return string
     */
    public function render(ThemeBlock $themeBlock, $blockData)
    {
        if ($themeBlock->isHtmlBlock()) {
            return $this->renderHtmlBlock($themeBlock, $blockData);
        } else {
            return $this->renderDynamicBlock($themeBlock, $blockData);
        }
    }

    /**
     * Render the given html theme block with the given stored block data.
     *
     * @param ThemeBlock $themeBlock
     * @param $blockData
     * @return string
     */
    protected function renderHtmlBlock(ThemeBlock $themeBlock, $blockData)
    {
        if (! empty($blockData)) {
            $html = $blockData;
        } else {
            $html = file_get_contents($themeBlock->getViewFile());
        }
        return $html;
    }

    /**
     * Render the given dynamic theme block with the given stored block data.
     *
     * @param ThemeBlock $themeBlock
     * @param $blockData
     * @return string
     */
    protected function renderDynamicBlock(ThemeBlock $themeBlock, $blockData)
    {
        $controller = new BaseController;
        $model = new BaseModel;
        $blockData = $blockData ?? [];

        if ($themeBlock->getModelFile()) {
            require_once $themeBlock->getModelFile();
            $modelClass = $themeBlock->getModelClass();
            $model = new $modelClass;
        }
        $model->init($themeBlock, $blockData, $this->forPageBuilder);

        if ($themeBlock->getControllerFile()) {
            require_once $themeBlock->getControllerFile();
            $controllerClass = $themeBlock->getControllerClass();
            $controller = new $controllerClass;
        }
        $controller->init($model, $this->forPageBuilder);
        $controller->handleRequest();

        // init additional variables that should be accessible in the view
        $page = $this->page;
        $block = $model;

        ob_start();
        require $themeBlock->getViewFile();
        $html = ob_get_contents();
        ob_end_clean();

        return $html;
    }
}
