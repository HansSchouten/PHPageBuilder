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
     * @var bool $editMode
     */
    protected $editMode;

    /**
     * Pass essential data to this Block model instance.
     *
     * @param ThemeBlock $block
     * @param array $data
     * @param bool $editMode
     */
    public function init(ThemeBlock $block, $data = [], $editMode = false)
    {
        $this->block = $block;
        $this->data = is_array($data) ? $data : [];
        $this->editMode = $editMode;
    }

    /**
     * Return the given setting stored for this block instance.
     *
     * @param $setting
     * @param bool $allowHtml
     * @return string
     */
    public function setting($setting, $allowHtml = false)
    {
        $value = $this->block->get('settings.' . $setting . '.value');

        if (isset($this->data['attributes'][$setting])) {
            $value = $this->data['attributes'][$setting];
        }

        return $allowHtml ? $value : e($value);
    }

}
