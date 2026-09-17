<?php

require_once __DIR__ . '/../src/Modules/GrapesJS/Upload/UploadValidator.php';
require_once __DIR__ . '/../src/Modules/GrapesJS/Upload/Uploader.php';

use PHPageBuilder\Modules\GrapesJS\Upload\Uploader;
use PHPageBuilder\Modules\GrapesJS\Upload\UploadValidator;

class TestCustomUploader extends Uploader
{
}

function assertUploadValidation($condition, $message)
{
    if (! $condition) {
        fwrite(STDERR, "UploadValidator test failed: {$message}\n");
        exit(1);
    }
}

$allowedFiles = [
    'photo.jpg',
    'image.webp',
    'vector.svg',
    'document.pdf',
    'archive.tar.gz',
    'video.mp4',
    'font.woff2',
    'data.csv',
    'template.html',
    'script-example.py',
    'php-logo.svg',
    'example.php-guide.pdf',
    'extensionless-file'
];

foreach ($allowedFiles as $fileName) {
    assertUploadValidation(UploadValidator::isAllowedFileName($fileName), "{$fileName} should be allowed");
}

$blockedFiles = [
    'shell.php',
    'shell.PHP8',
    'shell.phtml',
    'shell.php.jpg',
    'shell.php.',
    '../../shell.php',
    'example.phar.zip',
    '.htaccess',
    '.user.ini',
    'web.config'
];

foreach ($blockedFiles as $fileName) {
    assertUploadValidation(! UploadValidator::isAllowedFileName($fileName), "{$fileName} should be blocked");
}

assertUploadValidation(
    UploadValidator::sanitizeFileName('C:\\fakepath\\photo with spaces.jpg') === 'photo-with-spaces.jpg',
    'client path information should be removed'
);
assertUploadValidation(
    UploadValidator::sanitizeFileName('Mijn Mooie Foto.JPG') === 'mijn-mooie-foto.jpg',
    'the complete file name should be normalized to lowercase'
);
assertUploadValidation(
    UploadValidator::sanitizeFileName("bad\nname.jpg") === false,
    'control characters should be rejected'
);
assertUploadValidation(
    ! UploadValidator::isAllowedFileName('handler.cgi', ['cgi']),
    'custom executable extensions should be blocked'
);
assertUploadValidation(
    UploadValidator::normalizeMimeType("text/html\r\nX-Injected: yes") === 'application/octet-stream',
    'invalid MIME values should be replaced'
);

$temporaryFile = tempnam(sys_get_temp_dir(), 'phpb-upload-');
file_put_contents($temporaryFile, 'plain text upload');
$detectedMimeType = UploadValidator::detectMimeType($temporaryFile);
$uploader = new Uploader([
    'name' => 'document.txt',
    'tmp_name' => $temporaryFile,
    'size' => filesize($temporaryFile),
    'error' => 0,
    'type' => "text/html\r\nX-Injected: yes"
], false);
$customUploader = new TestCustomUploader([
    'name' => 'document.txt',
    'tmp_name' => $temporaryFile,
    'size' => filesize($temporaryFile),
    'error' => 0,
    'type' => 'application/x-fake-client-mime'
], false);
unlink($temporaryFile);
assertUploadValidation(
    UploadValidator::normalizeMimeType($detectedMimeType) === $detectedMimeType,
    'detected MIME types should be safe for use in a response header'
);
assertUploadValidation(
    $uploader->file_src_mime === $detectedMimeType,
    'the MIME type supplied by the client should not be trusted'
);
assertUploadValidation(
    $customUploader->file_src_mime === $detectedMimeType,
    'custom uploader subclasses should expose the detected MIME type without accessing the protected temp path'
);

echo "UploadValidator tests passed.\n";
