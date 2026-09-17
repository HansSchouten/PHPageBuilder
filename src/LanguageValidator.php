<?php

namespace PHPageBuilder;

class LanguageValidator
{
    /**
     * Accept common language/locale identifiers without allowing path or
     * JavaScript syntax. Custom codes remain possible and are not restricted
     * to the translations bundled with PHPageBuilder.
     *
     * @param mixed $languageCode
     * @return bool
     */
    public static function isValidCode($languageCode)
    {
        if (! is_string($languageCode) || $languageCode === '' || strlen($languageCode) > 64) {
            return false;
        }

        return preg_match('/^[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*$/D', $languageCode) === 1;
    }

    /**
     * Resolve a translation file only when it is a direct child of the given
     * translation folder. Resolving both paths also prevents symlink escapes.
     *
     * @param mixed $folder
     * @param mixed $languageCode
     * @return string|null
     */
    public static function resolveTranslationFile($folder, $languageCode)
    {
        if (! is_string($folder) || ! self::isValidCode($languageCode)) {
            return null;
        }

        $translationFolder = realpath($folder);
        if (! $translationFolder || ! is_dir($translationFolder)) {
            return null;
        }

        $translationFile = realpath($translationFolder . DIRECTORY_SEPARATOR . $languageCode . '.php');
        if (! $translationFile || ! is_file($translationFile) || dirname($translationFile) !== $translationFolder) {
            return null;
        }

        return $translationFile;
    }
}
