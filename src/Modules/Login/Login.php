<?php

namespace PHPageBuilder\Modules\Login;

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
            if ($_POST['username'] === phpb_config('login.username') && $_POST['password'] === phpb_config('login.password')) {
                $_SESSION['phpb_logged_in'] = true;
                phpb_redirect();
            } else {
                phpb_redirect('?alert=invalid_credentials');
            }
        }

        if ($route === 'logout') {
            unset($_SESSION['phpb_logged_in']);
            phpb_redirect();
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
        require __DIR__ . '/resources/views/layout.php';
    }
}
