<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Demo customers and orders so the admin dashboard has data to show.
 * Development only. Run with: php artisan db:seed --class=DemoStoreSeeder
 *
 * Uses ONLY the real catalogue (load it first with PrimeMeatCatalogueSeeder).
 * It never creates products.
 */
class DemoStoreSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::where('is_active', true)->get();

        if ($products->isEmpty()) {
            $this->command?->error('No products yet. Run: php artisan db:seed --class=PrimeMeatCatalogueSeeder');

            return;
        }

        $customers = collect([
            'Michelle Maluleke', 'Thabang Letsoalo', 'Amara Ani', 'Phillip Choshi', 'Lerato Mokoena',
            'Sipho Ndlovu', 'Ayesha Patel', 'Johan van Wyk', 'Nomsa Dlamini', 'Kagiso Molefe',
            'Zanele Khumalo', 'Pieter Botha', 'Naledi Sithole', 'Bongani Zulu', 'Fatima Hassan',
        ])->map(fn ($name) => User::firstOrCreate(
            ['email' => Str::slug($name, '.').'@example.com'],
            ['name' => $name, 'password' => Hash::make('password1')]
        ));

        $statusesByType = [
            Order::FULFILLMENT_DELIVERY => ['delivered', 'delivered', 'delivered', 'out_for_delivery', 'processing', 'pending', 'cancelled'],
            Order::FULFILLMENT_COLLECTION => ['collected', 'collected', 'collected', 'ready_for_collection', 'processing', 'pending', 'cancelled'],
        ];

        for ($i = 0; $i < 30; $i++) {
            $createdAt = now()->subDays(rand(0, 13))->subMinutes(rand(0, 1439));
            $type = Order::FULFILLMENT_TYPES[array_rand(Order::FULFILLMENT_TYPES)];

            $order = new Order();
            $order->forceFill([
                'user_id' => $customers->random()->id,
                'fulfillment_type' => $type,
                'status' => $statusesByType[$type][array_rand($statusesByType[$type])],
                'total' => 0,
            ])->save();

            $total = 0;
            foreach ($products->random(rand(1, 2)) as $product) {
                $price = (float) $product->price;
                $total += $price;
                $custom = rand(0, 1) === 1;
                $isQuarter = str_contains(strtolower($product->name), 'quarter');

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'grade' => $product->grade,
                    'price' => $price,
                    'unit_price' => $price,
                    'quantity' => 1,
                    'line_total' => $price,
                    'cut_type' => $custom ? 'custom' : 'traditional',
                    'selected_quarter' => $custom && $isQuarter ? (rand(0, 1) ? 'front' : 'hind') : null,
                ]);
            }

            $order->forceFill(['total' => $total, 'created_at' => $createdAt, 'updated_at' => $createdAt])->saveQuietly();
        }

        $this->call(DemoPaymentsSeeder::class);
    }
}
