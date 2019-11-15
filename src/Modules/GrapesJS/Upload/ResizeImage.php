<?php

namespace PHPageBuilder\Modules\GrapesJS\Upload;

use Exception;

/**
 * Class for resizing images.
 *
 * Credits: https://github.com/brunoribeiro94/php-upload
 *
 * Can resize to exact size
 * Max width size while keep aspect ratio
 * Max height size while keep aspect ratio
 * Automatic while keep aspect ratio
 */
class ResizeImage {

    /**
     * Extension of image
     *
     * @access private
     * @var string
     */
    private $ext;

    /**
     * created image
     *
     * @access private
     * @var string
     */
    private $image;

    /**
     *
     * Name new image
     *
     * @access private
     * @var string
     */
    private $newImage;

    /**
     *
     * Original width of image
     *
     * @access private
     * @var integer
     */
    private $origWidth;

    /**
     * Original height of image
     *
     * @access private
     * @var integer
     */
    private $origHeight;

    /**
     * Resize width to new image resized
     *
     * @access private
     * @var integer
     */
    private $resizeWidth;

    /**
     * Resize height to new image resized
     *
     * @access private
     * @var integer
     */
    private $resizeHeight;

    /**
     * Class constructor requires to send through the image filename.
     *
     * @param string $filename - Filename of the image you want to resize
     * @throws Exception
     */
    public function __construct($filename) {
        if (file_exists($filename)) {
            $this->setImage($filename);
        } else {
            throw new Exception('Image ' . $filename . ' can not be found, try another image.');
        }
    }

    /**
     * Set the image variable by using image create.
     *
     * @access private
     * @param string $filename - The image filename
     * @throws Exception
     */
    private function setImage($filename) {
        $size = getimagesize($filename);
        $this->ext = $size['mime'];

        switch ($this->ext) {
            // Image is a JPG
            case 'image/jpg':
            case 'image/jpeg':
                // create a jpeg extension
                $this->image = imagecreatefromjpeg($filename);
                break;

            // Image is a GIF
            case 'image/gif':
                $this->image = @imagecreatefromgif($filename);
                break;

            // Image is a PNG
            case 'image/png':
                $this->image = @imagecreatefrompng($filename);
                break;

            // Mime type not found
            default:
                throw new Exception("File is not an image, please use another file type.", 1);
        }

        $this->origWidth = imagesx($this->image);
        $this->origHeight = imagesy($this->image);
    }

    /**
     * Save the image as the image type the original image was
     *
     * @access public
     * @param  String $savePath     The path to store the new image
     * @param  string $imageQuality The qulaity level of image to create
     */
    public function saveImage($savePath, $imageQuality = "100") {
        switch ($this->ext) {
            case 'image/jpg':
            case 'image/jpeg':
                // Check PHP supports this file type
                if (imagetypes() & IMG_JPG) {
                    imagejpeg($this->newImage, $savePath, $imageQuality);
                }
                break;

            case 'image/gif':
                // Check PHP supports this file type
                if (imagetypes() & IMG_GIF) {
                    imagegif($this->newImage, $savePath);
                }
                break;

            case 'image/png':
                $invertScaleQuality = 9 - round(($imageQuality / 100) * 9);

                // Check PHP supports this file type
                if (imagetypes() & IMG_PNG) {
                    imagepng($this->newImage, $savePath, $invertScaleQuality);
                }
                break;
        }

        imagedestroy($this->newImage);
    }

    /**
     * Resize the image to these set dimensions
     *
     * @access public
     * @param  integer  $width            Max width of the image
     * @param  integer  $height           Max height of the image
     * @param  string   $resizeOption     Scale option for the image
     *
     * @version 0.3
     */
    public function resizeTo($width, $height, $resizeOption = 'default') {
        switch (strtolower($resizeOption)) {
            case 'exact':
                $this->resizeWidth = $width;
                $this->resizeHeight = $height;
                break;
            case 'maxwidth':
                $this->resizeWidth = $width;
                $this->resizeHeight = $this->resizeHeightByWidth($width);
                break;
            case 'maxheight':
                $this->resizeWidth = $this->resizeWidthByHeight($height);
                $this->resizeHeight = $height;
                break;
            case 'proportionally':
                $ratio_orig = $this->origWidth / $this->origHeight;
                $this->resizeWidth = $width;
                $this->resizeHeight = $height;
                if ($width / $height > $ratio_orig)
                    $this->resizeWidth = $height * $ratio_orig;
                else
                    $this->resizeHeight = $width / $ratio_orig;
                break;
            default:
                if ($this->origWidth > $width || $this->origHeight > $height) {
                    if ($this->origWidth > $this->origHeight) {
                        $this->resizeHeight = $this->resizeHeightByWidth($width);
                        $this->resizeWidth = $width;
                    } else if ($this->origWidth < $this->origHeight) {
                        $this->resizeWidth = $this->resizeWidthByHeight($height);
                        $this->resizeHeight = $height;
                    } else {
                        $this->resizeWidth = $width;
                        $this->resizeHeight = $height;
                    }
                } else {
                    $this->resizeWidth = $width;
                    $this->resizeHeight = $height;
                }
                break;
        }

        $this->newImage = imagecreatetruecolor($this->resizeWidth, $this->resizeHeight);
        if ($this->ext == "image/gif" || $this->ext == "image/png") {
            imagealphablending($this->newImage, false);
            imagesavealpha($this->newImage, true);
            $transparent = imagecolorallocatealpha($this->newImage, 255, 255, 255, 127);
            imagefilledrectangle($this->newImage, 0, 0, $this->resizeWidth, $this->resizeHeight, $transparent);
        }
        imagecopyresampled($this->newImage, $this->image, 0, 0, 0, 0, $this->resizeWidth, $this->resizeHeight, $this->origWidth, $this->origHeight);
    }

    /**
     * Get the resized height from the width keeping the aspect ratio
     *
     * @access private
     * @param  integer $width  Max image width
     * @return float
     */
    private function resizeHeightByWidth($width) {
        return floor(($this->origHeight / $this->origWidth) * $width);
    }

    /**
     * Get the resized width from the height keeping the aspect ratio
     *
     * @access private
     * @param  int $height - Max image height
     * @return float
     */
    private function resizeWidthByHeight($height) {
        return floor(($this->origWidth / $this->origHeight) * $height);
    }
}
