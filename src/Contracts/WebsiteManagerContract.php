<?php

namespace PHPageBuilder\Contracts;

interface WebsiteManagerContract
{
    /**
     * Render the website manager overview page.
     */
    public function renderOverview();

    /**
     * Render the website manager page settings (add/edit page form).
     */
    public function renderPageSettings();

    /**
     * Render the website manager menu settings (add/edit menu form).
     */
    public function renderMenuSettings();
}
