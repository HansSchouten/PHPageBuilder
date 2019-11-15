<?php

namespace PHPageBuilder;

class UploadedFile
{
    /**
     * Return the URL of this uploaded file.
     */
    public function getUrl()
    {
        return phpb_url('?file=' . $this->public_id);
    }
}
