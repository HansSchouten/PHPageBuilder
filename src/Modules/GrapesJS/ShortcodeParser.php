<?php

namespace PHPageBuilder\Modules\GrapesJS;

class ShortcodeParser
{

    /**
     * Perform the tasks for all shortcodes in the given html string.
     *
     * @param $html
     * @return string
     */
    public function doShortcodes($html)
    {
        return $this->doBlockShortcode($html);
    }

    /**
     * Render all dynamic blocks defined with shortcodes in the given html string.
     *
     * @param $html
     * @return string
     */
    protected function doBlockShortcode($html)
    {
        $html = '
        
        [block id="header" data="this is data"]
        
        
        ';

        $matches = $this->findMatches('block', $html);

        return $html;
    }


    /**
     * Return all matches of the given shortcode in the given html string.
     *
     * @param $shortcode
     * @param $html
     * @return array
     */
    protected function findMatches($shortcode, $html)
    {
        $regex = '/\[' . $shortcode . '(\s.*?)?\](?:([^\[]+)?\[\/' . $shortcode . '\])?/';
        preg_match_all($regex, $html, $allMatches);
        $matchAttributeStrings = $allMatches[1];

        // loop through the attribute strings of each $shortcode instance and add them to $matches
        $matches = [];
        foreach ($matchAttributeStrings as $matchAttributeString) {
            $matchAttributeString = trim($matchAttributeString);

            // as long as there are attributes in the attributes string, add them to $attributes
            $attributes = [];
            while (strpos($matchAttributeString, '=') !== false) {
                list($attribute, $remainingString) = explode('=', $matchAttributeString, 2);

                // if first char is ", get attribute value between ""
                if (strpos($remainingString, '"') === 0 && strpos($remainingString, '"', 1) !== false) {
                    list($empty, $value, $remainingString) = explode('"', $matchAttributeString, 3);
                    $attributes[$attribute] = $value;
                } else {
                    // no value exist between "", get value until next whitespace or until end of $remainingString
                    if (strpos($remainingString, ' ') !== false) {
                        list($value, $remainingString) = explode(' ', $matchAttributeString, 2);
                        $attributes[$attribute] = $value;
                    } else {
                        $attributes[$attribute] = $remainingString;
                        $remainingString = '';
                    }
                }

                $matchAttributeString = $remainingString;
            }

            $matches[] = $attributes;
        }

        dd($matches);

        return $matches;
    }

}
