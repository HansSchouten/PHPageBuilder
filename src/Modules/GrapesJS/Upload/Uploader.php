<?php

namespace PHPageBuilder\Modules\GrapesJS\Upload;

use Exception;

/**
 * File uploader class.
 *
 * Credits: https://github.com/brunoribeiro94/php-upload
 *
 * @see README.md
 * @version 0.6.2
 * @access public
 * @package Upload
 */
class Uploader {

    /**
     * Indicates if the file has been uploaded properly
     *
     * @var boolean
     */
    var $was_uploaded;

    /**
     * Holds eventual error message in plain english
     *
     * @access public
     * @var string
     */
    var $error;

    /**
     * filename
     * @access public
     * @var string
     */
    var $file_src_name;

    /**
     * file extension
     * @access public
     * @var string
     */
    var $file_src_name_ext;

    /**
     * Uploaded file size, in bytes
     *
     * @access public
     * @var double
     */
    var $file_src_size;

    /**
     * Uploaded file size, in bytes
     *
     * @access public
     * @var integer
     */
    var $file_src_errors;

    /**
     * File source temp
     * @access private
     * @var string
     */
    private $file_src_temp;

    /**
     * Uploaded file MIME type
     *
     * @access public
     * @var string
     */
    var $file_src_mime;

    /**
     * final file name
     * @access public
     * @var string
     */
    var $final_file_name;

    /**
     * file width resolution
     * @access public
     * @var integer
     */
    var $file_width;

    /**
     * file height resolution
     * @access public
     * @var integer
     */
    var $file_height;

    /**
     * Set this variable to change the maximum size in bytes for an uploaded file
     *
     * Default value is the value <i>upload_max_filesize</i> from php.ini
     *
     * Remember you can also set calling <pre> $Upload->file_max_size($value) </pre>
     *
     * @access private
     * @var double
     */
    private $get_file_max_size = 8000000;

    /**
     * Set auto replace if the file already exist
     *
     * Remember you can also set calling <pre> $Upload->auto_replace($value_boolean) </pre>
     *
     * @access private
     * @var boolean
     */
    private $get_auto_replace = true;

    /**
     * Set auto create path if the folder not exist
     *
     * Remember you can also set calling <pre> $Upload->auto_create_path($value_boolean) </pre>
     *
     * @access private
     * @var boolean
     */
    private $get_auto_create_path = true;

    /**
     * Allowed MIME type
     *
     * @access public
     * @var array
     */
    var $MIME_allowed = array(
        "application/arj",
        "application/excel",
        "application/gnutar",
        "application/msword",
        "application/mspowerpoint",
        "application/octet-stream",
        "application/pdf",
        "application/powerpoint",
        "application/postscript",
        "application/plain",
        "application/rtf",
        "application/vnd.ms-excel",
        "application/vocaltec-media-file",
        "application/wordperfect",
        "application/x-bzip",
        "application/x-bzip2",
        "application/x-compressed",
        "application/x-excel",
        "application/x-gzip",
        "application/x-latex",
        "application/x-midi",
        "application/x-msexcel",
        "application/x-rtf",
        "application/x-sit",
        "application/x-stuffit",
        "application/x-shockwave-flash",
        "application/x-troff-msvideo",
        "application/x-zip-compressed",
        "application/xml",
        "application/zip",
        "audio/aiff",
        "audio/basic",
        "audio/midi",
        "audio/mod",
        "audio/mpeg",
        "audio/mpeg3",
        "audio/wav",
        "audio/x-aiff",
        "audio/x-au",
        "audio/x-mid",
        "audio/x-midi",
        "audio/x-mod",
        "audio/x-mpeg-3",
        "audio/x-wav",
        "audio/xm",
        "image/bmp",
        "image/gif",
        "image/jpeg",
        "image/pjpeg",
        "image/x-icon",
        "image/png",
        "image/x-png",
        "image/tiff",
        "image/x-tiff",
        "image/x-windows-bmp",
        "multipart/x-zip",
        "multipart/x-gzip",
        "music/crescendo",
        "text/richtext",
        "text/plain",
        "text/xml",
        "video/avi",
        "video/mpeg",
        "video/msvideo",
        "video/quicktime",
        "video/quicktime",
        "video/x-mpeg",
        "video/x-ms-wmv",
        "video/x-ms-asf",
        "video/x-ms-asf-plugin",
        "video/x-msvideo",
        "x-music/x-midi"
    );

    /**
     * Magic Metthod
     *
     * @param string|array $img Image Source
     * @param boolean $autoRead Auto read $_FILE
     *
     * @return boolean
     */
    public function __construct($img, $autoRead = true) {
        $file = $autoRead ? $_FILES[$img] : $img;
        if (!isset($file)) {
            $this->error = 'image can not be loaded, Please check the input name if it is equal to the constructor parameter of the class or check for the tag in the form enctype="multipart/form-data"';
            $this->was_uploaded = false;
            return false;
        }

        // extract info from file uploaded
        $this->file_src_name = $file["name"];
        $this->file_src_temp = $file["tmp_name"];
        $this->file_src_size = $file["size"];
        $this->file_src_errors = $file['error'];
        $this->file_src_mime = $file['type'];
        $this->file_src_name_ext = pathinfo($file["name"], PATHINFO_EXTENSION);

        $this->was_uploaded = true;
        return true;
    }

    /**
     * Run the uploader.
     *
     * @return bool
     * @throws Exception
     */
    public function run() {
        // checks the final name if it is in shuffle mode
        if ($this->file_name !== true) {
            // preserve the file extension if there
            if (!pathinfo($this->file_name, PATHINFO_EXTENSION)) {
                $file = $this->file_name . '.' . $this->file_src_name_ext;
            } else {
                $file = $this->file_name;
            }
            $path = $this->upload_to . $file;
        } else {
            $hash = md5(uniqid(rand(), true));
            $file = $hash . '.' . $this->file_src_name_ext;
            $path = $this->upload_to . $file;
        }

        $get_mime = isset($this->mime_check) ? true : false;

        // checks MIME type which are allowed
        if ($get_mime && empty($this->file_src_mime)) {
            $this->was_uploaded = false;
            $this->error = "MIME type can't be detected!";
        } elseif ($get_mime && !empty($this->file_src_mime) && !in_array($this->file_src_mime, $this->MIME_allowed)) {
            $this->was_uploaded = false;
            $this->error = "Incorrect type of file";
        }

        // checks file maximum size
        if ($this->file_src_size > $this->get_file_max_size) {
            $this->error = 'File too big Original Size : ' . $this->file_src_size . ' File size limit : ' . $this->get_file_max_size;
            $this->was_uploaded = false;
            return false;
        }

        // checks if the destination directory exists, and attempt to create it
        if ($this->get_auto_create_path) {
            if (!$this->r_mkdir($this->upload_to)) {
                $this->was_uploaded = false;
                $this->error = "Destination directory can't be created. Can't carry on a process";
                return false;
            }
        } elseif (!is_dir($this->upload_to)) {
            $this->error = "Destination directory doesn't exist. Can't carry on a process";
            return false;
        }


        // checks file already exist or if are to replace it
        if (file_exists($path)) {
            if (!$this->get_auto_replace) {
                $this->was_uploaded = false;
                $this->error = $this->file_src_name . ' already exists. Please change the file name';
            }
            return false;
        }

        // checks more likely errors that can happen
        switch ($this->file_src_errors) {
            case 0:
                // all is OK
                break;
            case 1:
                $this->was_uploaded = false;
                $this->error = "File upload error (the uploaded file exceeds the upload_max_filesize directive in php.ini)";
                break;
            case 2:
                $this->was_uploaded = false;
                $this->error = "File upload error (the uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the html form)";
                break;
            case 3:
                $this->was_uploaded = false;
                $this->error = "File upload error (the uploaded file was only partially uploaded)";
                break;
            case 4:
                $this->was_uploaded = false;
                $this->error = "File upload error (no file was uploaded)";
                break;
            default:
                $this->was_uploaded = false;
                $this->error = "File upload error (unknown error code)";
        }

        // checks if not occurred an error to upload file
        if ($this->was_uploaded) {
            if (move_uploaded_file($this->file_src_temp, $path)) {
                $this->final_file_name = $file;
                // extracts image dimensions
                list($w, $h) = getimagesize($path);
                $this->file_width = $w;
                $this->file_height = $h;

                // the resize mode is available ?
                if (isset($this->resize)) {
                    $resize = new ResizeImage($path);
                    $resize->resizeTo($this->image_x, $this->image_y, $this->resize_option);
                    $resize->saveImage($path);
                }
                return true;
            } else {
                $this->was_uploaded = false;
                $this->error = 'Moving uploaded file failed.';
                return false;
            }
        }

        return false;
    }

    /**
     * Creates directories recursively
     *
     * @access private
     * @param  string  $path Path to create
     * @param  integer $mode Optional permissions
     *
     * @return boolean Success
     */
    private function r_mkdir($path, $mode = 0777) {
        return is_dir($path) || ( $this->r_mkdir(dirname($path), $mode) && $this->_mkdir($path, $mode) );
    }

    /**
     * Creates directory
     *
     * @access private
     * @param  string  $path Path to create
     * @param  integer $mode Optional permissions
     *
     * @return boolean Success
     */
    private function _mkdir($path, $mode = 0777) {
        $old = umask(0);
        $res = @mkdir($path, $mode);
        umask($old);
        return $res;
    }

    /**
     * Set the variable this function to define final name of the uploaded file.
     * use the value true for generate unique name (random name)
     *
     * @access public
     * @param boolean|string $file_name Final name of the file uploaded
     *
     * @return Uploader
     */
    public function file_name($file_name) {
        $this->file_name = $file_name;
        return $this;
    }

    /**
     * Set the variable this function to define auto replacement if the file already exist
     *
     * @access public
     * @param boolean $bool
     *
     * @return Uploader
     */
    public function auto_replace($bool) {
        $this->get_auto_replace = $bool;
        return $this;
    }

    /**
     *
     * Set the variable this function to define max size file is allowed
     *
     * @access public
     * @param integer $size Size max in Bytes 1 000 000 bytes is equal to 1 MB
     *
     * @return Uploader
     */
    public function file_max_size($size) {
        $this->get_file_max_size = (int) $size;
        return $this;
    }

    /**
     * Set the variable this function to false if you don't want to check the MIME against the allowed list
     * This variable is set to true by default for security reason
     *
     * @access public
     * @param boolean $bool Set to false to not check
     *
     * @return Uploader
     */
    public function mime_check($bool = true) {
        $this->mime_check = $bool;
        return $this;
    }

    /**
     * Set the variable this function to choose a new path location for the image
     *
     * @access public
     * @param string $path Path location of the uploaded file, with an ending slash
     *
     * @return Uploader
     */
    public function upload_to($path) {
        $this->upload_to = $path;
        return $this;
    }

    /**
     * Set the variable this function to true to resize the file if it is an image
     *
     * You will probably want to set {@link image_x()} and {@link image_y()}, and maybe one of the ratio variables
     *
     * @access public
     * @param boolean $bool Default value is false (no resizing)
     *
     * @return Uploader
     */
    public function resize($bool = false) {
        $this->resize = $bool;
        return $this;
    }

    /**
     * Set the variable this function to the wanted (or maximum/minimum) width for the processed image, in pixels
     *
     * @access public
     * @param integer $width Default value is 150
     *
     * @return Uploader
     */
    public function image_x($width) {
        $this->image_x = $width;
        return $this;
    }

    /**
     * Set the variable this function to the wanted (or maximum/minimum) height for the processed image, in pixels
     *
     * @access public
     * @param integer $height Default value is 150
     *
     * @return Uploader
     */
    public function image_y($height = 150) {
        $this->image_y = $height;
        return $this;
    }

    /**
     * Set the variable this function to choose the scale option for the image
     *
     * @access public
     * @param string $option Default value is default, but you can use too <b>exact</b> or  <b>maxwidth</b> or <b>maxheight</b> or <b>proportionally</b>
     *
     * @return Uploader
     */
    public function resize_option($option = 'default') {
        $this->resize_option = $option;
        return $this;
    }

    /**
     * Alias for {@link resize()} instead of using both {@link image_x()} && {@link image_y()} && {@link resize_option()}
     *
     * @access public
     *
     * @param integer   $width          Max width of the image
     * @param integer   $height         Max height of the image
     * @param string    $resizeOption   Scale option for the image
     *
     * @return Uploader
     */
    public function resize_to($width = 150, $height = 150, $resizeOption = 'default') {
        self::resize(true);
        self::image_x($width);
        self::image_y($height);
        self::resize_option($resizeOption);
        return $this;
    }

}
