<?php

namespace PHPageBuilder;

use PHPageBuilder\Contracts\PageContract;

class Page implements PageContract
{
    /**
     * @var array|null $data
     */
    protected $data;

    /**
     * Set the data stored for this page.
     *
     * @param array|null $data
     * @param bool $fullOverwrite       whether to fully overwrite or extend existing data
     */
    public function setData($data, $fullOverwrite = true)
    {
        if ($fullOverwrite) {
            $this->data = $data;
        }  elseif (is_array($data)) {
            $this->data = is_null($this->data) ? [] : $this->data;
            foreach ($data as $key => $value) {
                $this->data[$key] = $value;
            }
        }
    }

    /**
     * Return the data stored for this page.
     *
     * @return array|null
     */
    public function getData()
    {
        return $this->data;
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

        if ($this->data && is_array($this->data)) {
            return $this->data[$property] ?? null;
        }

        return null;
    }
}
