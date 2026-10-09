<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Sample payments for orders that don't have any yet. Development only.
 * Run with: php artisan db:seed --class=DemoPaymentsSeeder  (safe to run more than once)
 *
 * - pending orders     -> a pending payment
 * - cancelled orders   -> a failed payment
 * - everything else    -> a completed payment (some get an earlier failed attempt first)
 */
class DemoPaymentsSeeder extends Seeder
{
    public function run(): void
    {
        Order::doesntHave('payments')->orderBy('created_at')->each(function (Order $order) {
            $when = $order->created_at->copy()->addMinutes(rand(1, 20));

            if ($order->status !== Order::STATUS_PENDING && $order->status !== Order::STATUS_CANCELLED && rand(1, 5) === 1) {
                $this->make($order, Payment::STATUS_FAILED, $when);
                $when = $when->copy()->addMinutes(rand(2, 15));
            }

            $status = match ($order->status) {
                Order::STATUS_PENDING => Payment::STATUS_PENDING,
                Order::STATUS_CANCELLED => Payment::STATUS_FAILED,
                default => Payment::STATUS_COMPLETED,
            };

            $this->make($order, $status, $when);
        });
    }

    private function make(Order $order, string $status, $when): void
    {
        $payment = Payment::create([
            'order_id' => $order->id,
            'amount' => $order->total,
            'status' => $status,
            'method' => 'payfast',
            'provider_reference' => $status === Payment::STATUS_PENDING ? null : (string) rand(1000000, 9999999),
            'paid_at' => $status === Payment::STATUS_COMPLETED ? $when : null,
        ]);

        $payment->forceFill(['created_at' => $when, 'updated_at' => $when])->saveQuietly();
    }
}
