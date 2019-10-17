<?php

namespace PHPageBuilder;

class ThemeBlock
{
    /**
     * @var Theme $theme
     */
    protected $theme;

    /**
     * @var string $blockSlug
     */
    protected $blockSlug;

    /**
     * Theme constructor.
     *
     * @param Theme $theme         the theme this block belongs to
     * @param string $blockSlug
     */
    public function __construct(Theme $theme, string $blockSlug)
    {
        $this->theme = $theme;
        $this->blockSlug = $blockSlug;
    }

    /**
     * Return the absolute folder path of this theme block.
     *
     * @return string
     */
    public function getFolder()
    {
        return $this->theme->getFolder() . '/blocks/' . $this->blockSlug;
    }
}
