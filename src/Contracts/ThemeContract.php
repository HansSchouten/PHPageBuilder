<?php

namespace PHPageBuilder\Contracts;

interface ThemeContract
{
    /**
     * Return all blocks of this theme.
     *
     * @return array        array of ThemeBlock instances
     */
    public function getThemeBlocks();

    /**
     * Return the folder of this theme.
     *
     * @return mixed
     */
    public function getFolder();
}
