<?php

namespace PHPageBuilder;

class ThemeBlock
{
    /**
     * @var $config
     */
    protected $config;

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
        $this->config = include $this->getFolder() . '/config.php';
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

    /**
     * Return the unique identifier of this block.
     *
     * @return string
     */
    public function getId()
    {
        return $this->blockSlug;
    }

    /**
     * Return configuration with the given key (as dot-separated multidimensional array selector).
     *
     * @param $key
     * @return mixed|string
     */
    public function get($key)
    {
        // if no dot notation is used, return first dimension value or empty string
        if (strpos($key, '.') === false) {
            return $this->config[$key] ?? null;
        }

        // if dot notation is used, traverse config string
        $segments = explode('.', $key);
        $subArray = $this->config;
        foreach ($segments as $segment) {
            if (isset($subArray[$segment])) {
                $subArray = &$subArray[$segment];
            } else {
                return null;
            }
        }

        return $subArray;
    }

    /**
     * Render this ThemeBlock instance and return the content.
     *
     * @return string
     */
    public function getRenderedContent()
    {
        // init variables that should be accessible in the view
        $block = $this;

        ob_start();
        require $this->getFolder() . '/view.php';
        $content = ob_get_contents();
        ob_end_clean();

        return $content;
    }
}
