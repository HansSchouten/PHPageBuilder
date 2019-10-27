<?php

namespace PHPageBuilder\Repositories;

use PHPageBuilder\Contracts\PageRepositoryContract;
use PHPageBuilder\Page;

class PageRepository extends BaseRepository implements PageRepositoryContract
{
    /**
     * The pages database table.
     *
     * @var string
     */
    protected $table = 'pages';

    /**
     * The class that represents each page.
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

        return parent::create([
            'name' => $data['name'],
            'title' => $data['title'],
            'route' => $data['route'],
            'layout' => $data['layout'],
        ]);
    }

    /**
     * Update the given page with the given updated data.
     *
     * @param $page
     * @param array $data
     * @return bool|object|null
     */
    public function update($page, array $data)
    {
        $fields = ['name', 'title', 'route', 'layout'];
        foreach ($fields as $field) {
            if (! isset($data[$field]) || ! is_string($data[$field])) {
                return false;
            }
        }

        return parent::update($page, [
            'name' => $data['name'],
            'title' => $data['title'],
            'route' => $data['route'],
            'layout' => $data['layout'],
        ]);
    }

    /**
     * Update the given page with the given updated page data
     *
     * @param $page
     * @param array $data
     * @return bool|object|null
     */
    public function updatePageData($page, array $data)
    {
        return parent::update($page, [
            'data' => json_encode($data),
        ]);
    }
}
