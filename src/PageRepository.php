<?php

namespace PHPageBuilder;

use PHPageBuilder\Contracts\PageContract;
use PHPageBuilder\Contracts\PageRepositoryContract;
use Exception;

class PageRepository implements PageRepositoryContract
{
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
        return Page::all();
    }

    /**
     * Return the page with the given id, or null.
     *
     * @param $id
     * @return PageContract|null
     */
    public function findWithId($id)
    {
        return Page::find($id);
    }
}
