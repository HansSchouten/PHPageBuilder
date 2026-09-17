<?php

namespace PHPageBuilder\Modules\GrapesJS\Upload;

class UploadValidator
{
    /**
     * Extensions that can be executed by common PHP handlers.
     *
     * This is deliberately a denylist rather than a media allowlist: uploads
     * such as SVG, WebP, PDF, video, fonts and custom asset types stay valid.
     *
     * @var array
     */
    protected static $blockedExtensions = [
        'pht',
        'phtm',
        'phtml',
        'phar',
        'phps'
    ];

    /**
     * Per-directory server configuration files must never be uploadable.
     *
     * @var array
     */
    protected static $blockedFileNames = [
        '.htaccess',
        '.htpasswd',
        '.user.ini',
        'web.config'
    ];

    /**
     * Strip client-side path information and reject unsafe header/path bytes.
     *
     * @param mixed $fileName
     * @return string|false
     */
    public static function sanitizeFileName($fileName)
    {
        if (! is_string($fileName) || $fileName === '' || preg_match('/[\x00-\x1F\x7F]/', $fileName)) {
            return false;
        }

        $fileName = basename(str_replace('\\', '/', $fileName));
        $fileName = trim($fileName);

        if ($fileName === '' || $fileName === '.' || $fileName === '..' || strpbrk($fileName, ':;') !== false) {
            return false;
        }

        $fileName = preg_replace('/ +/', '-', $fileName);

        return function_exists('mb_strtolower')
            ? mb_strtolower($fileName, 'UTF-8')
            : strtolower($fileName);
    }

    /**
     * Reject executable extensions, including double-extension variants.
     * Additional extensions may be configured for custom server handlers.
     *
     * @param string $fileName
     * @param array $additionalBlockedExtensions
     * @return bool
     */
    public static function isAllowedFileName($fileName, array $additionalBlockedExtensions = [])
    {
        $fileName = self::sanitizeFileName($fileName);
        if ($fileName === false) {
            return false;
        }

        $normalizedFileName = strtolower(rtrim($fileName, ". \t"));
        if (in_array($normalizedFileName, self::$blockedFileNames, true)) {
            return false;
        }

        $blockedExtensions = self::$blockedExtensions;
        foreach ($additionalBlockedExtensions as $extension) {
            if (! is_string($extension)) {
                continue;
            }
            $extension = strtolower(ltrim(trim($extension), '.'));
            if ($extension !== '') {
                $blockedExtensions[] = $extension;
            }
        }

        $extensionParts = explode('.', $normalizedFileName);
        array_shift($extensionParts);
        foreach ($extensionParts as $extension) {
            $extension = trim($extension);
            if (preg_match('/^php[0-9]*$/', $extension) || in_array($extension, $blockedExtensions, true)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Determine the MIME type from the uploaded bytes, never from $_FILES['type'].
     * Unknown formats remain uploadable and are served as generic binary data.
     *
     * @param string $filePath
     * @return string
     */
    public static function detectMimeType($filePath)
    {
        $mimeType = false;

        if (is_string($filePath) && is_file($filePath)) {
            if (class_exists('finfo')) {
                $fileInfo = new \finfo(FILEINFO_MIME_TYPE);
                $mimeType = $fileInfo->file($filePath);
            } elseif (function_exists('mime_content_type')) {
                $mimeType = mime_content_type($filePath);
            }
        }

        return self::normalizeMimeType($mimeType);
    }

    /**
     * Return a header-safe MIME type.
     *
     * @param mixed $mimeType
     * @return string
     */
    public static function normalizeMimeType($mimeType)
    {
        if (! is_string($mimeType)) {
            return 'application/octet-stream';
        }

        $mimeType = strtolower(trim(explode(';', $mimeType, 2)[0]));
        if (! preg_match('/^[a-z0-9][a-z0-9!#$&^_.+\-]*\/[a-z0-9][a-z0-9!#$&^_.+\-]*$/i', $mimeType)) {
            return 'application/octet-stream';
        }

        return $mimeType;
    }
}
