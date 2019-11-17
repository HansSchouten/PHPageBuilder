<?php

namespace PHPageBuilder\Contracts;

interface AuthContract
{
    /**
     * Process the current GET or POST request and redirect or render the requested page.
     *
     * @param $action
     */
    public function handleRequest($action);
}
