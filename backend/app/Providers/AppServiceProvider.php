<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Password reset emails link to the React page, not a Laravel page.
        // FRONTEND_URL in .env: http://localhost:5173 locally, https://primemeat.online live.
        ResetPassword::createUrlUsing(function ($user, string $token) {
            // Read through config (not env()) so it still works after `php artisan config:cache`
            $frontend = rtrim(config('services.payfast.frontend_url') ?: config('app.frontend_url') ?: 'http://localhost:5173', '/');

            return $frontend.'/reset-password?token='.$token.'&email='.urlencode($user->getEmailForPasswordReset());
        });

        // PrimeMeat wording instead of Laravel's default email
        ResetPassword::toMailUsing(function ($user, string $token) {
            $url = call_user_func(ResetPassword::$createUrlCallback, $user, $token);
            $minutes = config('auth.passwords.'.config('auth.defaults.passwords').'.expire', 60);

            return (new MailMessage)
                ->subject('PrimeMeat: reset your password')
                ->greeting('Hi '.strtok((string) $user->name, ' ').',')
                ->line('We received a request to reset the password for your PrimeMeat account.')
                ->action('Choose a new password', $url)
                ->line('This link expires in '.$minutes.' minutes and can only be used once.')
                ->line('If you didn\'t ask for this, you can ignore this email. Your password won\'t change.');
        });
    }
}
