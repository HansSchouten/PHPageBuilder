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
}
