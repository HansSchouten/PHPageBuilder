<?php

namespace PHPageBuilder\Modules\GrapesJS;

use PHPageBuilder\ThemeBlock;

class BlockViewFunctions
{
    const EMPTY_ELEMENTS = [
        'area', 'base', 'br', 'col', 'hr', 'img', 'input', 'link', 'meta', 'param', 'command', 'keygen', 'source'
    ];

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
     * BlockViewFunctions constructor.
     *
     * @param ThemeBlock $block
     * @param $data
     * @param bool $editMode
     */
    public function __construct(ThemeBlock $block, $data = [], $editMode = false)
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

        return $allowHtml ? $value : e($value);
    }

    /**
     * Return a html element of the given tag with the given settings.
     *
     * @param $tag
     * @param $settings
     * @return string
     */
    public function element($tag, $settings)
    {
        if ($this->editMode) {
            return $this->editElement($tag, $settings);
        }

        $attributes = '';

        if (isset($settings['fixed'])) {
            foreach ($settings['fixed'] as $attribute => $value) {
                $attributes .= ' ' . $attribute . '="' . e($value) . '"';
            }
        }

        // construct html element
        $html = "<{$tag} $attributes>";
        if (! in_array($tag, self::EMPTY_ELEMENTS)) {
            if (isset($settings['editable']['content'])) {
                $content = $this->data['content'];
                $html .= $content;
            }
            $html .= "</{$tag}>";
        }

        return $html;
    }

    /**
     * Return a html element of the given tag with the given settings, editable by GrapesJS.
     *
     * @param $tag
     * @param $settings
     * @return string
     */
    protected function editElement($tag, $settings)
    {
        $attributes = 'phpb-editable';

        if (isset($settings['fixed'])) {
            foreach ($settings['fixed'] as $attribute => $value) {
                $attributes .= ' ' . $attribute . '="' . e($value) . '"';
            }
        }

        // construct html element
        $html = "<{$tag} $attributes>";
        if (! in_array($tag, self::EMPTY_ELEMENTS)) {
            if (isset($settings['editable']['content'])) {
                $content = $settings['editable']['content'];
                $html .= $content;
            }
            $html .= "</{$tag}>";
        }

        return $html;
    }

}
