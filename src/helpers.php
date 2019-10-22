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

if (! function_exists('phpb_alert')) {
    /**
     * Return whether an alert message with the given key is set.
     *
     * @param  string  $key
     * @return bool
     */
    function phpb_alert($key)
    {
        return (isset($_GET['alert']) && $_GET['alert'] === $key);
    }
}

if (! function_exists('phpb_asset')) {
    /**
     * Return the public path of a PHPageBuilder asset.
     *
     * @param  string  $path
     * @return string
     */
    function phpb_asset($path)
    {
        return '/packages/phpagebuilder/dist/' . $path;
    }
}

if (! function_exists('phpb_config')) {
    /**
     * Return the configuration with the given key (as dot-separated multidimensional array selector).
     *
     * @param  string  $key
     * @return mixed
     */
    function phpb_config($key)
    {
        global $phpb_config;

        // if no dot notation is used, return first dimension value or empty string
        if (strpos($key, '.') === false) {
            return $phpb_config[$key] ?? '';
        }

        // if dot notation is used, traverse config string
        $segments = explode('.', $key);
        $subArray = $phpb_config;
        foreach ($segments as $segment) {
            if (isset($subArray[$segment])) {
                $subArray = &$subArray[$segment];
            } else {
                return '';
            }
        }

        return $subArray;
    }
}

if (! function_exists('phpb_trans')) {
    /**
     * Return the translation of the given key (as dot-separated multidimensional array selector).
     *
     * @param  string  $key
     * @return string
     */
    function phpb_trans($key)
    {
        global $phpb_translations;

        // if no dot notation is used, return first dimension value or empty string
        if (strpos($key, '.') === false) {
            return $phpb_translations[$key] ?? '';
        }

        // if dot notation is used, traverse translations string
        $segments = explode('.', $key);
        $subArray = $phpb_translations;
        foreach ($segments as $segment) {
            if (isset($subArray[$segment])) {
                $subArray = &$subArray[$segment];
            } else {
                return '';
            }
        }

        // if the remaining sub array is a string, return this value
        if (is_string($subArray)) {
            return $subArray;
        }
        return '';
    }
}

if (! function_exists('phpb_redirect')) {
    /**
     * Redirect to the given page builder route.
     * The given URL will be prefixed with pagebuilder_url from config.
     *
     * @param  string  $route
     * @return string
     */
    function phpb_redirect($route = '')
    {
        $prefix = phpb_config('project.pagebuilder_url');
        if (empty($prefix)) {
            $prefix = '/';
        }

        header('Location: ' . $prefix . $route);
        exit();
    }
}

