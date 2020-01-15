<?php

if (! function_exists('e')) {
    /**
     * Encode HTML special characters in a string.
     *
     * @param string $value
     * @param bool $doubleEncode
     * @return string
     */
    function e($value, $doubleEncode = true)
    {
        return htmlspecialchars($value, ENT_QUOTES, 'UTF-8', $doubleEncode);
    }
}

if (! function_exists('phpb_asset')) {
    /**
     * Return the public path of a PHPageBuilder asset.
     *
     * @param string $path
     * @return string
     */
    function phpb_asset($path)
    {
        return phpb_config('general.assets_url') . '/' . $path;
    }
}

if (! function_exists('phpb_theme_asset')) {
    /**
     * Return the public path of an asset of the current theme.
     *
     * @param string $path
     * @return string
     */
    function phpb_theme_asset($path)
    {
        $themeFolder = phpb_config('theme.folder_url') . '/' . phpb_config('theme.active_theme');
        return $themeFolder . '/' . $path;
    }
}

if (! function_exists('phpb_flash')) {
    /**
     * Return the flash data with the given key (as dot-separated multidimensional array selector) or false if not set.
     *
     * @param $key
     * @param bool $encode
     * @return bool|mixed
     */
    function phpb_flash($key, $encode = true)
    {
        global $phpb_flash;

        // if no dot notation is used, return first dimension value or empty string
        if (strpos($key, '.') === false) {
            if ($encode) {
                return e($phpb_flash[$key] ?? false);
            }
            return $phpb_flash[$key] ?? false;
        }

        // if dot notation is used, traverse config string
        $segments = explode('.', $key);
        $subArray = $phpb_flash;
        foreach ($segments as $segment) {
            if (isset($subArray[$segment])) {
                $subArray = &$subArray[$segment];
            } else {
                return false;
            }
        }

        // if the remaining sub array is a string, return this piece of flash data
        if (is_string($subArray)) {
            if ($encode) {
                return e($subArray);
            }
            return $subArray;
        }
        return false;
    }
}

if (! function_exists('phpb_config')) {
    /**
     * Return the configuration with the given key (as dot-separated multidimensional array selector).
     *
     * @param string $key
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
     * @param $key
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

        // if the remaining sub array is a string, return this translation
        if (is_string($subArray)) {
            return $subArray;
        }
        return '';
    }
}

if (! function_exists('phpb_full_url')) {
    /**
     * Give the full URL of a given relative URL.
     *
     * @param string $relativeUrl
     * @return string
     */
    function phpb_full_url($relativeUrl)
    {
        $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http");
        return  $protocol . "://" . $_SERVER['SERVER_NAME'] . $relativeUrl;
    }
}

if (! function_exists('phpb_url')) {
    /**
     * Give the full URL of a given public path.
     *
     * @param string $module
     * @param array $parameters
     * @param bool $fullUrl
     * @return string
     */
    function phpb_url($module, array $parameters = [], $fullUrl = true)
    {
        $url = $fullUrl ? phpb_full_url('') : '';
        $url .= phpb_config($module . '.url');

        if (! empty($parameters)) {
            $url .= '?';
            $pairs = [];
            foreach ($parameters as $key => $value) {
                $pairs[] = e($key) . '=' . e($value);
            }
            $url .= implode('&', $pairs);
        }

        return $url;
    }
}

if (! function_exists('phpb_in_module')) {
    /**
     * Return whether we are currently accessing the given module.
     *
     * @param string $module
     * @return bool
     */
    function phpb_in_module($module)
    {
        $url = phpb_url($module, [], false);
        $currentUrl = explode('?', $_SERVER['REQUEST_URI'], 2)[0];
        return $currentUrl === $url;
    }
}

if (! function_exists('phpb_on_url')) {
    /**
     * Return whether we are currently on the given URL.
     *
     * @param string $module
     * @param array $parameters
     * @return bool
     */
    function phpb_on_url($module, array $parameters = [])
    {
        $url = phpb_url($module, $parameters, false);
        return $_SERVER['REQUEST_URI'] === $url;
    }
}

if (! function_exists('phpb_redirect')) {
    /**
     * Redirect to the given URL with optional session flash data.
     *
     * @param string $url
     * @param array $flashData
     */
    function phpb_redirect($url, $flashData = [])
    {
        if (! empty($flashData)) {
            $_SESSION["phpb_flash"] = $flashData;
        }

        header('Location: ' . $url);
        exit();
    }
}

if (! function_exists('phpb_route_parameters')) {
    /**
     * Return the named route parameters resolved from the current URL.
     *
     * @return array|null
     */
    function phpb_route_parameters()
    {
        global $phpb_route_parameters;

        return $phpb_route_parameters ?? [];
    }
}

if (! function_exists('phpb_route_parameter')) {
    /**
     * Return the value of the given named route parameter resolved from the current URL.
     *
     * @param string $parameter
     * @return string|null
     */
    function phpb_route_parameter($parameter)
    {
        global $phpb_route_parameters;

        return $phpb_route_parameters[$parameter] ?? null;
    }
}

if (! function_exists('phpb_field_value')) {
    /**
     * Return the posted value or the attribute value of the given instance.
     *
     * @param $attribute
     * @param object $instance
     * @return string
     */
    function phpb_field_value($attribute, $instance = null)
    {
        if (isset($_POST[$attribute])) {
            return e($_POST[$attribute]);
        }
        if (isset($instance)) {
            return e($instance->$attribute);
        }
        return '';
    }
}

if (! function_exists('phpb_instance')) {
    /**
     * Return an instance of the given class as defined in config.
     *
     * @param string $name          the name of the config main section in which the class path is defined
     * @param array $params
     * @return object|null
     */
    function phpb_instance(string $name, $params = [])
    {
        if (phpb_config($name . '.class')) {
            $className = phpb_config($name . '.class');
            return new $className(...$params);
        }
        return null;
    }
}

if (! function_exists('phpb_autoload')) {
    /**
     * Autoload classes from the PHPageBuilder package.
     *
     * @param  string $className
     */
    function phpb_autoload($className)
    {
        // PSR-0 autoloader
        $className = ltrim($className, '\\');
        $fileName  = '';
        $namespace = '';
        if ($lastNsPos = strripos($className, '\\')) {
            $namespace = substr($className, 0, $lastNsPos);
            $className = substr($className, $lastNsPos + 1);
            $fileName  = str_replace('\\', DIRECTORY_SEPARATOR, $namespace) . DIRECTORY_SEPARATOR;
        }
        $fileName .= str_replace('_', DIRECTORY_SEPARATOR, $className) . '.php';

        // remove leading PHPageBuilder/ from the class path
        $fileName = str_replace('PHPageBuilder/', '', $fileName);

        // include class files starting in the src directory
        require __DIR__ . '/../' . $fileName;
    }
}
