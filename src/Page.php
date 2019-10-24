<?php

namespace PHPageBuilder;

use PHPageBuilder\Contracts\PageContract;
use Illuminate\Database\Eloquent\Model;

class Page extends Model implements PageContract
{
    protected $guarded = [];
}
