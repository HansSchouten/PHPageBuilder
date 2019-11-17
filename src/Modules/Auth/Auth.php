<?php

namespace PHPageBuilder\Modules\Auth;

use PHPageBuilder\Contracts\AuthContract;

class Auth implements AuthContract
{
    /**
     * Process the current GET or POST request and redirect or render the requested page.
     *
     * @param $action
     */
    public function handleRequest($action)
    {
        if ($action === 'login' && isset($_POST['username']) && isset($_POST['password'])) {
            if ($_POST['username'] === phpb_config('auth.username') && $_POST['password'] === phpb_config('auth.password')) {
                $_SESSION['phpb_logged_in'] = true;
                phpb_redirect(phpb_url('website_manager'));
            } else {
                phpb_redirect(phpb_url('website_manager'), [
                    'message-type' => 'warning',
                    'message' => phpb_trans('auth.invalid-credentials')
                ]);
            }
        }

        if ($action === 'logout') {
            unset($_SESSION['phpb_logged_in']);
            phpb_redirect(phpb_url('website_manager'));
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
        $viewFile = 'login-form';
        require __DIR__ . '/resources/views/layout.php';
    }
}
