<?php

namespace PHPageBuilder\Modules\GrapesJS\Block;

class BaseController
{
    /**
     * @var BaseModel $model
     */
    protected $model;

    /**
     * @var bool $forPageBuilder
     */
    protected $forPageBuilder;

    /**
     * Pass essential data to this Block model instance.
     *
     * @param BaseModel $model
     * @param bool $forPageBuilder
     */
    public function init(BaseModel $model, $forPageBuilder = false)
    {
        $this->model = $model;
        $this->forPageBuilder = $forPageBuilder;
    }

    /**
     * Handle the current request.
     */
    public function handleRequest()
    {
    }

}
