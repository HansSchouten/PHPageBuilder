<?php

namespace PHPageBuilder\GrapesJS;

use PHPageBuilder\ThemeBlock;

/**
 * Class ThemeBlockAdapter
 *
 * Class for adapting a ThemeBlock into a JSON object understood by GrapesJS.
 *
 * @package PHPageBuilder\GrapesJS
 */
class ThemeBlockAdapter
{
    /**
     * @var ThemeBlock $block
     */
    protected $block;

    /**
     * ThemeBlockAdapter constructor.
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
            'content' => $this->block->getRenderedContent(),
        ];

        if ($this->block->get('icon')) {
            $data['attributes'] = [
                'class' => $this->block->get('icon')
            ];
        }

        return $data;
    }
}
