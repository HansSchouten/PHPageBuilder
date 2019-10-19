<?php

if (! function_exists('e')) {
    /**
     * Encode HTML special characters in a string.
     *
     * @param  string  $value
     * @param  bool  $doubleEncode
     * @return string
     */
    function e($value, $doubleEncode = true)
    {
        return htmlspecialchars($value, ENT_QUOTES, 'UTF-8', $doubleEncode);
    }
}

if (! function_exists('phpagebuilder_asset')) {
    /**
     * Return the public path of a PHPageBuilder asset
     *
     * @param  string  $path
     * @return string
     */
    function phpagebuilder_asset($path)
    {
        return '/packages/phpagebuilder/dist/' . $path;
    }
}
