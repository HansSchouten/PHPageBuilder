<?php

namespace PHPageBuilder\Modules\GrapesJS\Block;

use PHPageBuilder\ThemeBlock;

class BaseModel
{
    /**
     * @var ThemeBlock $block
     */
    protected $block;

    /**
     * @var array $data
     */
    protected $data;

    /**
     * @var bool $forPageBuilder
     */
    protected $forPageBuilder;

    /**
     * Construct a new model instance.
     *
     * @param ThemeBlock $block
     * @param array $data
     * @param bool $forPageBuilder
     */
    public function __construct(ThemeBlock $block, $data = [], $forPageBuilder = false)
    {
        $this->block = $block;
        $this->data = is_array($data) ? $data : [];
        $this->forPageBuilder = $forPageBuilder;
        $this->init();
    }

    /**
     * Initialize the model.
     */
    protected function init()
    {
    }

    /**
     * Return the given setting stored for this block instance using the page builder.
     *
     * @param $setting
     * @param bool $allowHtml
     * @return string
     */
    public function setting($setting, $allowHtml = false)
    {
        $value = $this->block->get('settings.' . $setting . '.value');

        if (isset($this->data['settings']['attributes'][$setting])) {
            $value = $this->data['settings']['attributes'][$setting];
        }

        return $allowHtml ? $value : e($value);
    }

    /**
     * Return data passed to this block instance with the given key.
     *
     * @param $key
     * @return string
     */
    public function data($key)
    {
        return $this->data[$key] ?? null;
    }

}
