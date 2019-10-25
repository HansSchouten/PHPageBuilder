<?php

namespace PHPageBuilder\Modules\GrapesJS;

class BlockViewFunctions
{
    const EMPTY_ELEMENTS = [
        'area', 'base', 'br', 'col', 'hr', 'img', 'input', 'link', 'meta', 'param', 'command', 'keygen', 'source'
    ];

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
     * @param $data
     * @param bool $editMode
     */
    public function __construct($data, $editMode = false)
    {
        $this->data = $data;
        $this->editMode = $editMode;
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
        $attributes = 'gjs-editable';

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
