<?php

namespace PHPageBuilder\Modules\GrapesJS;

use PHPageBuilder\ThemeBlock;

/**
 * Class PageBuilderBlockAdapter
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
     * PageBuilderBlockAdapter constructor.
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
     * Return an array representation of the theme block, for adding as a block in GrapesJS.
     *
     * @return array
     */
    public function getBlockArray()
    {
        $data = [
            'label' => $this->getTitle(),
            'content' => $this->block->getRenderedContent(new BlockViewFunctions([], true)),
        ];

        $iconClass = 'fa fa-edit';
        if ($this->block->get('icon')) {
            $iconClass = $this->block->get('icon');
        }
        $data['attributes'] = [
            'class' => $iconClass
        ];

        return $data;
    }
}
