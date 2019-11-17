<?php

namespace PHPageBuilder;

class UploadedFile
{
    /**
     * Return the URL of this uploaded file.
     */
    public function getUrl()
    {
        return '/?file=' . $this->public_id;
    }
}
