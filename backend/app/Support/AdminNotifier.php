<?php

namespace App\Support;

use App\Models\AdminNotificationPreference;
use App\Models\User;
use App\Notifications\AdminAlert;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Throwable;

use function Illuminate\Support\defer;

/**
 * Emails an alert to every active admin who has that alert type switched on.
 *
 * Sending happens AFTER the response has gone back to the browser (defer), so a slow
 * or failing mail server never slows down or breaks checkout, sign-up, etc.
 */
class AdminNotifier
{
    /** @param callable(): (AdminAlert|null) $build  builds the email when it's time to send */
    public static function send(string $type, callable $build): void
    {
        defer(function () use ($type, $build) {
            try {
                $admins = User::where('is_admin', true)
                    ->whereNull('suspended_at')
                    ->get()
                    ->filter(fn (User $admin) => AdminNotificationPreference::forUser($admin->id)[$type] ?? false);

                $alert = $admins->isNotEmpty() ? $build() : null;

                if ($alert) {
                    Notification::send($admins, $alert);
                }
            } catch (Throwable $e) {
                Log::warning("Admin alert '{$type}' not sent: ".$e->getMessage());
            }
        });
    }
}
