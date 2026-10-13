<?php

namespace App\Providers;

use App\Http\Controllers\Admin\ProductController;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use App\Notifications\AdminAlert;
use App\Support\AdminNotifier;
use Illuminate\Support\ServiceProvider;

/**
 * Watches for the events behind Settings > Notification and emails admins.
 *
 * Only things that happen through the website send emails. Artisan commands and
 * seeders (e.g. DemoStoreSeeder creating 30 orders) don't, so nobody gets flooded.
 */
class AdminNotificationServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            return;
        }

        // Payments: email on every status change; a completed payment is also a new (paid) order.
        // Nothing is sent when checkout starts, so unpaid/abandoned checkouts don't email anyone.
        Payment::updated(function (Payment $payment) {
            if (! $payment->wasChanged('status')) {
                return;
            }
            $id = $payment->id;

            AdminNotifier::send('payment_updates', function () use ($id) {
                $payment = Payment::with('order:id,order_number')->find($id);

                return $payment ? new AdminAlert(
                    'Payment '.$payment->payment_number.' is '.$payment->status,
                    [
                        'Payment '.$payment->payment_number.' for order '.($payment->order?->order_number ?? '-')
                            .' (R'.number_format((float) $payment->amount, 2).') is now '.$payment->status.'.',
                    ],
                    'View payments log',
                    '/admin/payments',
                ) : null;
            });

            if ($payment->status === Payment::STATUS_COMPLETED) {
                $orderId = $payment->order_id;
                AdminNotifier::send('new_orders', function () use ($orderId) {
                    $order = Order::with(['user:id,name', 'items'])->find($orderId);

                    return $order ? new AdminAlert(
                        'New paid order '.$order->order_number,
                        [
                            ($order->user?->name ?? 'A customer').' paid for order '.$order->order_number.'.',
                            'Items: '.$order->items->count().' · Total: R'.number_format(self::orderTotal($order), 2)
                                .' · '.ucfirst((string) $order->fulfillment_type),
                        ],
                        'View orders',
                        '/admin/orders',
                    ) : null;
                });
            }
        });

        // New user registrations
        User::created(function (User $user) {
            $name = $user->name;
            $email = $user->email;
            AdminNotifier::send('new_users', fn () => new AdminAlert(
                'New user: '.$name,
                [$name.' ('.$email.') just created an account.'],
                'View users',
                '/admin/users',
            ));
        });

        // System alerts: admin access granted, accounts suspended, admin passwords changed
        User::updated(function (User $user) {
            $events = [];
            if ($user->wasChanged('is_admin') && $user->is_admin) {
                $events[] = $user->name.' ('.$user->email.') was given admin access.';
            }
            if ($user->wasChanged('suspended_at') && $user->suspended_at) {
                $events[] = $user->name.' ('.$user->email.') was suspended.';
            }
            if ($user->wasChanged('password') && $user->is_admin) {
                $events[] = 'The password for admin account '.$user->email.' was changed.';
            }

            foreach ($events as $text) {
                AdminNotifier::send('system_alerts', fn () => new AdminAlert('Account security alert', [$text], 'View users', '/admin/users'));
            }
        });

        // Stock alerts: a published product drops to the low-stock level (or sells out)
        Product::updated(function (Product $product) {
            if (! $product->wasChanged('stock') || $product->status === 'draft') {
                return;
            }

            $before = (int) $product->getOriginal('stock');
            $now = (int) $product->stock;
            if ($before > ProductController::LOW_STOCK && $now <= ProductController::LOW_STOCK) {
                $label = $product->name.' (Grade '.$product->grade.')';
                AdminNotifier::send('stock_alerts', fn () => new AdminAlert(
                    $now === 0 ? $label.' is out of stock' : $label.' is low on stock',
                    [$label.' now has '.$now.' left in stock.'],
                    'View products',
                    '/admin/products',
                ));
            }
        });
    }

    /** Works with either name for the order total column. */
    private static function orderTotal(Order $order): float
    {
        return (float) ($order->getAttribute('total') ?? $order->getAttribute('total_amount') ?? 0);
    }
}
