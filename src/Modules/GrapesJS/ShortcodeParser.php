<?php

namespace PHPageBuilder\Modules\GrapesJS;

use Exception;

class ShortcodeParser
{
    /**
     * @var PageRenderer $pageRenderer
     */
    protected $pageRenderer;

    /**
     * ShortcodeParser constructor.
     *
     * @param PageRenderer $pageRenderer
     */
    public function __construct(PageRenderer $pageRenderer)
    {
        $this->pageRenderer = $pageRenderer;
    }

    /**
     * Perform the tasks for all shortcodes in the given html string.
     *
     * @param $html
     * @return string
     * @throws Exception
     */
    public function doShortcodes($html)
    {
        return $this->doBlockShortcodes($html);
    }

    /**
     * Render all dynamic blocks defined with shortcodes in the given html string.
     *
     * @param $html
     * @param int $maxDepth     maximum depth of blocks loaded inside blocks
     * @return string
     * @throws Exception
     */
    protected function doBlockShortcodes($html, $maxDepth = 15)
    {
        if ($maxDepth === 0) {
            throw new Exception("Maximum doBlockShortcodes depth has been reached, "
                . "probably due to a circular shortcode reference in the defined theme blocks.");
        }

        $matches = $this->findMatches('block', $html);
        if (empty($matches)) {
            return $html;
        }

        foreach ($matches as $match) {
            if (isset($match['attributes']['id'])) {
                $blockHtml = $this->pageRenderer->block($match['attributes']['id']);
                // replace shortcode match with the $blockHtml (this replaces only the first match)
                $pos = strpos($html, $match['shortcode']);
                if ($pos !== false) {
                    $html = substr_replace($html, $blockHtml, $pos, strlen($match['shortcode']));
                }
            }
        }

        // recursive call to render shortcodes inside the newly loaded blocks
        return $this->doBlockShortcodes($html, $maxDepth - 1);
    }

    /**
     * Return all matches of the given shortcode in the given html string.
     *
     * @param $shortcode
     * @param $html
     * @return array            an array with for each $shortcode occurrence an array of attributes
     */
    protected function findMatches($shortcode, $html)
    {
        // RegEx: https://www.regextester.com/104625
        $regex = '/\[' . $shortcode . '(\s.*?)?\](?:([^\[]+)?\[\/' . $shortcode . '\])?/';
        preg_match_all($regex, $html, $pregMatchAll);
        $fullMatches = $pregMatchAll[0];
        $matchAttributeStrings = $pregMatchAll[1];

        // loop through the attribute strings of each $shortcode instance and add the parsed variants to $matches
        $matches = [];
        foreach ($matchAttributeStrings as $i => $matchAttributeString) {
            $matchAttributeString = trim($matchAttributeString);

            // as long as there are attributes in the attributes string, add them to $attributes
            $attributes = [];
            while (strpos($matchAttributeString, '=') !== false) {
                list($attribute, $remainingString) = explode('=', $matchAttributeString, 2);
                $attribute = trim($attribute);

                // if first char is " and at least two " exist, get attribute value between ""
                if (strpos($remainingString, '"') === 0 && strpos($remainingString, '"', 1) !== false) {
                    list($empty, $value, $remainingString) = explode('"', $remainingString, 3);
                    $attributes[$attribute] = $value;
                } else {
                    // attribute value was not between "", get value until next whitespace or until end of $remainingString
                    if (strpos($remainingString, ' ') !== false) {
                        list($value, $remainingString) = explode(' ', $remainingString, 2);
                        $attributes[$attribute] = $value;
                    } else {
                        $attributes[$attribute] = $remainingString;
                        $remainingString = '';
                    }
                }

                $matchAttributeString = $remainingString;
            }

            $matches[] = [
                'shortcode' => $fullMatches[$i],
                'attributes' => $attributes
            ];
        }

        return $matches;
    }

}
