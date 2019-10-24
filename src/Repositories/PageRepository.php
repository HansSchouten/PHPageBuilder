<?php

namespace PHPageBuilder\Repositories;

use PHPageBuilder\Contracts\PageRepositoryContract;
use PHPageBuilder\Page;

class PageRepository extends Repository implements PageRepositoryContract
{
    /**
     * The database table of this repository.
     *
     * @var string
     */
    protected $table = 'pages';

    /**
     * The class that represents each record of this repository's table.
     *
     * @var string
     */
    protected $class = Page::class;

    /**
     * PageRepository constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Create a new page.
     *
     * @param array $data
     * @return bool|object
     */
    public function create(array $data)
    {
        $fields = ['name', 'title', 'route', 'layout'];
        foreach ($fields as $field) {
            if (! isset($data[$field]) || ! is_string($data[$field])) {
                return false;
            }
        }

        return Page::create([
            'name' => $data['name'],
            'title' => $data['title'],
            'route' => $data['route'],
            'layout' => $data['layout'],
        ]);
    }
}
