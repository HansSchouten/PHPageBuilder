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

        $this->config = [];
        if (file_exists($this->getFolder() . '/config.php')) {
            $this->config = include $this->getFolder() . '/config.php';
        }
    }

    /**
     * Return the absolute folder path of this theme block.
     *
     * @return string
     */
    public function getFolder()
    {
        return $this->theme->getFolder() . '/blocks/' . basename($this->blockSlug);
    }

    /**
     * Return the view file of this theme block.
     *
     * @return string
     */
    public function getViewFile()
    {
        if ($this->isPhpBlock()) {
            return $this->getFolder() . '/view.php';
        }
        return $this->getFolder() . '/view.html';
    }

    /**
     * Return the file path of the thumbnail of this block.
     *
     * @return string
     */
    public function getThumbPath()
    {
        if (file_exists($this->getFolder() . '/thumb.jpg')) {
            return $this->getFolder() . '/thumb.jpg';
        }
        $hash = md5(file_get_contents($this->getViewFile()));
        return $this->getFolder() . "/thumb-{$hash}.jpg";
    }

    /**
     * Return the slug identifying this type of block.
     *
     * @return string
     */
    public function getSlug()
    {
        return $this->blockSlug;
    }

    /**
     * Return whether this block is a block containing/allowing PHP code.
     *
     * @return bool
     */
    public function isPhpBlock()
    {
        return file_exists($this->getFolder() . '/view.php');
    }

    /**
     * Return whether this block is a plain html block that does not contain/allow PHP code.
     *
     * @return bool
     */
    public function isHtmlBlock()
    {
        return (! $this->isPhpBlock());
    }

    /**
     * Return configuration with the given key (as dot-separated multidimensional array selector).
     *
     * @param $key
     * @return mixed
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
}
