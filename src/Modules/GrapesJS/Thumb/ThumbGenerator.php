<?php

namespace PHPageBuilder\Modules\GrapesJS\Thumb;

use PHPageBuilder\Theme;
use PHPageBuilder\ThemeBlock;
use Exception;

class ThumbGenerator {

    /**
     * Generate one missing or outdated thumb of the given theme.
     *
     * @param Theme $theme
     */
    public function generateNextMissingThumb(Theme $theme)
    {
        foreach ($theme->getThemeBlocks() as $block) {
            if ($this->generateThumbForBlock($block)) {
                return;
            }
        }
    }

    /**
     * Generate a thumbnail for the given block, if no thumb is present or if the thumb needs an update.
     *
     * @param ThemeBlock $block
     * @return bool                 returns whether a thumb has been generated (or attempted to be generated)
     */
    protected function generateThumbForBlock(ThemeBlock $block)
    {
        $thumbPath = $block->getThumbPath();
        if (file_exists($thumbPath)) {
            return false;
        }

        try {
            $url = '';
            $this->urlToJpg($url, $thumbPath);
        } catch (Exception $e) {
        }

        return true;
    }

    /**
     * Obtain a jpg image of the given URL.
     *
     * @param $url
     * @param $destinationImagePath
     */
    protected function urlToJpg($url, $destinationImagePath)
    {
        $json = file_get_contents("https://www.googleapis.com/pagespeedonline/v1/runPagespeed?url={$url}&screenshot=true");
        $data = json_decode($json, true);
        $imageData = $data['screenshot']['data'];
        $imageData = str_replace(['_', '-'], ['/', '+'], $imageData);

        $file = fopen($destinationImagePath, "wb");
        fwrite($file, base64_decode($imageData));
        fclose($file);
    }

}
