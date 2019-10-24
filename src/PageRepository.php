<?php

namespace PHPageBuilder;

use PHPageBuilder\Contracts\PageContract;
use PHPageBuilder\Contracts\PageRepositoryContract;
use Exception;

class PageRepository implements PageRepositoryContract
{
    /**
     * @var DB $db
     */
    protected $db;

    /**
     * The pages table.
     *
     * @var string
     */
    protected $table = 'pages';

    /**
     * PageRepository constructor.
     */
    public function __construct()
    {
        global $phpb_db;
        $this->db = $phpb_db;
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

    /**
     * Destroy the given page.
     *
     * @param PageContract $page
     * @throws Exception
     */
    public function destroy(PageContract $page)
    {
        $this->findWithId($page->id)->delete();
    }

    /**
     * Return an array of all pages.
     *
     * @return array
     */
    public function getAll()
    {
        $result = [];
        foreach ($this->db->all($this->table) as $record) {
            $page = new Page;
            foreach($record as $k => $v)
                $page->$k = $v;
            $result[] = $page;
        }
        return $result;
    }

    /**
     * Return the page with the given id, or null.
     *
     * @param $id
     * @return PageContract|null
     */
    public function findWithId($id)
    {
        $record = $this->db->findWithId($this->table, $id);
        $page = new Page;
        foreach($record as $k => $v)
            $page->$k = $v;
        return $page;
    }
}
