<?php

namespace PHPageBuilder;

use PHPageBuilder\Contracts\PageContract;

class Page implements PageContract
{
    /**
     * @var array|null $attributes
     */
    protected $attributes;

    /**
     * Set the data stored for this page.
     *
     * @param array|null $data
     * @param bool $fullOverwrite       whether to fully overwrite or extend existing data
     */
    public function setData($data, $fullOverwrite = true)
    {
        // if page builder data is set, try to decode json
        if (isset($data['data']) && is_string($data['data'])) {
            $data['data'] = json_decode($data['data'], true);
        }
        if ($fullOverwrite) {
            $this->attributes = $data;
        }  elseif (is_array($data)) {
            $this->attributes = is_null($this->attributes) ? [] : $this->attributes;
            foreach ($data as $key => $value) {
                $this->attributes[$key] = $value;
            }
        }
    }

    /**
     * Return all data stored for this page (page builder data and other data set via setData).
     *
     * @return array|null
     */
    public function getData()
    {
        return $this->attributes;
    }

    /**
     * Return the page builder data stored for this page.
     *
     * @return array|null
     */
    public function getBuilderData()
    {
        return $this->attributes['data'] ?? [];
    }

    /**
     * Return the layout (file name) of this page.
     *
     * @return string
     */
    public function getLayout()
    {
        return $this->get('layout');
    }

    /**
     * Return the route of this page.
     */
    public function getRoute()
    {
        return $this->get('route');
    }

    /**
     * Get the value of the given property of this Page.
     *
     * @param $property
     * @return mixed|null
     */
    public function get($property)
    {
        if (property_exists($this, $property)) {
            return $this->$property;
        }

        if ($this->attributes && is_array($this->attributes)) {
            return $this->attributes[$property] ?? null;
        }

        return null;
    }
}
