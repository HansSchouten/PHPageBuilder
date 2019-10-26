<?php

namespace PHPageBuilder\Modules\GrapesJS;

use PHPageBuilder\ThemeBlock;

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
     * @var ThemeBlock $block
     */
    protected $block;

    /**
     * BlockAdapter constructor.
     *
     * @param ThemeBlock $block
     */
    public function __construct(ThemeBlock $block)
    {
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
        return null;
    }

    /**
     * Return an array representation of the theme block, for adding as a block to GrapesJS.
     *
     * @return array
     */
    public function getBlockManagerArray()
    {
        $data = [
            'label' => $this->getTitle(),
            'category' => $this->getCategory(),
            'content' => $this->block->getRenderedContent(new BlockViewFunctions([], true)),
            // html based blocks are stored in database and hence all whitelisted tags (headings, p, ..) can be edited
            'whitelist_on_tag' => $this->block->isHtmlBlock(),
        ];

        $iconClass = 'fa fa-edit';
        if ($this->block->get('icon')) {
            $iconClass = $this->block->get('icon');
        }
        $data['attributes'] = ['class' => $iconClass];

        return $data;
    }
}
