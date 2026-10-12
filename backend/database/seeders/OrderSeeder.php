<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $userId = 22;

        $user = User::find($userId);

        if (! $user) {
            throw new RuntimeException(
                "User ID {$userId} does not exist."
            );
        }

        $products = Product::where('is_active', true)
            ->orderBy('id')
            ->get();

        if ($products->isEmpty()) {
            throw new RuntimeException(
                'No active products were found in the database.'
            );
        }

        $hasPrice = Schema::hasColumn('order_items', 'price');
        $hasGrade = Schema::hasColumn('order_items', 'grade');

        $deliveryStatuses = [
            Order::STATUS_PENDING,
            Order::STATUS_PROCESSING,
            Order::STATUS_OUT_FOR_DELIVERY,
            Order::STATUS_DELIVERED,
            Order::STATUS_CANCELLED,
        ];

        $collectionStatuses = [
            Order::STATUS_PENDING,
            Order::STATUS_PROCESSING,
            Order::STATUS_READY_FOR_COLLECTION,
            Order::STATUS_COLLECTED,
            Order::STATUS_CANCELLED,
        ];

        for ($i = 1; $i <= 20; $i++) {
            $orderNumber = sprintf('DEMO-U22-%03d', $i);

            // Skip orders already created by this seeder.
            if (Order::where('order_number', $orderNumber)->exists()) {
                continue;
            }

            $fulfillmentType = $i % 2 === 0
                ? Order::FULFILLMENT_COLLECTION
                : Order::FULFILLMENT_DELIVERY;

            $statuses = $fulfillmentType === Order::FULFILLMENT_COLLECTION
                ? $collectionStatuses
                : $deliveryStatuses;

            $status = $statuses[($i - 1) % count($statuses)];

            // Make the first three orders recent.
            $daysAgo = $i <= 3
                ? rand(0, 6)
                : rand(8, 120);

            $orderDate = now()->subDays($daysAgo);

            DB::transaction(function () use (
                $userId,
                $products,
                $orderNumber,
                $fulfillmentType,
                $status,
                $orderDate,
                $hasPrice,
                $hasGrade
            ) {
                $order = new Order;

                $order->forceFill([
                    'order_number' => $orderNumber,
                    'user_id' => $userId,
                    'fulfillment_type' => $fulfillmentType,
                    'status' => $status,
                    'total' => 0,
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate,
                ]);

                $order->save();

                $selectedProducts = $products
                    ->shuffle()
                    ->take(min(rand(1, 2), $products->count()));

                $total = 0;

                foreach ($selectedProducts as $product) {
                    $unitPrice = (float) $product->price;
                    $quantity = 1;
                    $lineTotal = round($unitPrice * $quantity, 2);

                    $itemData = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'unit_price' => $unitPrice,
                        'quantity' => $quantity,
                        'line_total' => $lineTotal,
                    ];

                    if ($hasPrice) {
                        $itemData['price'] = $unitPrice;
                    }

                    if ($hasGrade) {
                        $itemData['grade'] = $product->grade;
                    }

                    $item = $order->items()->create($itemData);

                    $item->forceFill([
                        'created_at' => $orderDate,
                        'updated_at' => $orderDate,
                    ])->saveQuietly();

                    $total += $lineTotal;
                }

                $order->forceFill([
                    'total' => round($total, 2),
                ])->saveQuietly();
            });
        }
    }
}
