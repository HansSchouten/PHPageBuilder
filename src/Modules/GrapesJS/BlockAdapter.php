<?php

namespace PHPageBuilder\Modules\GrapesJS;

use PHPageBuilder\ThemeBlock;
use Exception;

/**
 * Class BlockAdapter
 *
 * Class for adapting a ThemeBlock into a JSON object understood by the GrapesJS page builder.
 *
 * @package PHPageBuilder\GrapesJS
 */
class BlockAdapter
{
    /**
     * @var PageRenderer $pageRenderer
     */
    protected $pageRenderer;

    /**
     * @var ThemeBlock $block
     */
    protected $block;

    /**
     * BlockAdapter constructor.
     *
     * @param PageRenderer $pageRenderer
     * @param ThemeBlock $block
     */
    public function __construct(PageRenderer $pageRenderer, ThemeBlock $block)
    {
        $this->pageRenderer = $pageRenderer;
        $this->block = $block;
    }

    /**
     * Return the unique identifier of the theme block.
     *
     * @return string
     */
    public function getId()
    {
        return $this->block->getId();
    }

    /**
     * Return the visible title of this block.
     *
     * @return string
     */
    public function getTitle()
    {
        if ($this->block->get('title')) {
            return $this->block->get('title');
        }
        return str_replace('-', ' ', ucfirst($this->getId()));
    }

    /**
     * Return the category this block belongs to.
     *
     * @return string|null
     */
    public function getCategory()
    {
        if ($this->block->get('category')) {
            return $this->block->get('category');
        }
        return phpb_trans('pagebuilder.default-category');
    }

    /**
     * Return an array representation of the theme block, for adding as a block to GrapesJS.
     *
     * @return array
     * @throws Exception
     */
    public function getBlockManagerArray()
    {
        $data = [
            'label' => $this->getTitle(),
            'category' => $this->getCategory(),
            'content' => $this->pageRenderer->getGrapesJSBlockHtml($this->block, new BlockViewFunctions([], true))
        ];

        $iconClass = 'fa fa-bars';
        if ($this->block->get('icon')) {
            $iconClass = $this->block->get('icon');
        }
        $data['attributes'] = ['class' => $iconClass];

        return $data;
    }
}
