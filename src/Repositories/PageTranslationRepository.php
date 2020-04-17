<?php

namespace PHPageBuilder\Repositories;

use PHPageBuilder\Contracts\PageTranslationRepositoryContract;

class PageTranslationRepository extends BaseRepository implements PageTranslationRepositoryContract
{
    /**
     * The pages database table.
     *
     * @var string
     */
    protected $table = 'page_translations';

    /**
     * The class that represents each page translation.
     *
     * @var string
     */
    protected $class;

    /**
     * PageTranslationRepository constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->class = phpb_instance('page.translation');
    }
}
