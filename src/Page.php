<?php

namespace PHPageBuilder;

class Page
{
    /**
     * The data of this page instance.
     *
     * @var array $data
     */
    protected $data;

    /**
     * Page constructor.
     */
    public function __construct()
    {
        $this->data = [];
    }

    /**
     * Set the data of this page instance (for example page title, meta description)
     *
     * @param array $data
     */
    public function setData(array $data)
    {
        $this->data = $data;
    }

    /**
     * Overloading method to enable a get method for accessing any custom data.
     *
     * @param $name
     * @return mixed
     */
    public function __get($name)
    {
        if (array_key_exists($name, $this->data)) {
            return $this->data[$name];
        }
        return null;
    }
}
