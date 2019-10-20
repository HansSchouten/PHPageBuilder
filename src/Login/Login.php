<?php

namespace PHPageBuilder\Login;

use PHPageBuilder\Contracts\LoginContract;

class Login implements LoginContract
{
    /**
     * Process the current GET or POST request and redirect or render the requested page.
     *
     * @param $route
     * @param $action
     */
    public function handleRequest($route, $action)
    {
        if ($route === 'login' && isset($_POST['username']) && isset($_POST['password'])) {
            if ($_POST['username'] === '' && $_POST['password'] === '') {
                echo '';
            } else {
                header("Location: /?alert=invalid_credentials");
            }
        }

        if (! isset($_SESSION['phpb_logged_in'])) {
            $this->renderLoginForm();
            exit();
        }
    }

    /**
     * Render the login form.
     */
    public function renderLoginForm()
    {
        $page = 'login-form';
        require_once 'resources/views/layout.php';
    }
}
