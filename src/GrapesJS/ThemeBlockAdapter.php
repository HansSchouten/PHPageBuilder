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
     * Return an array representation of the configured ThemeBlock to be added to GrapesJS.
     *
     * @return array
     */
    public function getArray()
    {
        return [
            'id' => $this->block->getId(),
            'label' => $this->block->get('title'),
            'content' => $this->block->getRenderedContent(),
        ];
    }
}
