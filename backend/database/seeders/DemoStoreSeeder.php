<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Sample products, customers and orders so the admin dashboard has data to show.
 * Development only. Run with: php artisan db:seed --class=DemoStoreSeeder
 *
 * Uses the team's products table (name, grade, description, price, image, is_active).
 */
class DemoStoreSeeder extends Seeder
{
    public function run(): void
    {
        // [name, grade, description, price]
        $products = collect([
            ['Ribeye Steak', 'A', 'Well-marbled ribeye, priced per kg.', 289.99],
            ['Sirloin Steak', 'A', 'Lean sirloin with a fat cap, priced per kg.', 239.99],
            ['T-Bone Steak', 'A', 'Sirloin and fillet on the bone, priced per kg.', 219.99],
            ['Beef Mince', 'AB', 'Lean beef mince, priced per kg.', 119.99],
            ['Beef Short Rib', 'AB', 'Slow-cook short rib, priced per kg.', 169.99],
            ['Traditional Boerewors', 'A', 'Coriander-spiced farm sausage, priced per kg.', 129.99],
            ['Lamb Loin Chops', 'A', 'Karoo lamb loin chops, priced per kg.', 319.99],
            ['Lamb Shank', 'AB', 'Lamb shanks for braising, priced per kg.', 259.99],
            ['Whole Chicken', 'A', 'Free-range whole chicken, about 1.6 kg.', 89.99],
            ['Chicken Thighs', 'A', 'Bone-in chicken thighs, priced per kg.', 79.99],
            ['Pork Belly', 'A', 'Skin-on pork belly, priced per kg.', 149.99],
            ['Pork Rashers', 'A', 'Thick-cut pork rashers, priced per kg.', 139.99],
        ])->map(fn ($p) => Product::firstOrCreate(
            ['name' => $p[0]],
            ['grade' => $p[1], 'description' => $p[2], 'price' => $p[3], 'is_active' => true]
        ));

        $customers = collect([
            'Michelle Maluleke', 'Thabang Letsoalo', 'Amara Ani', 'Phillip Choshi', 'Lerato Mokoena',
            'Sipho Ndlovu', 'Ayesha Patel', 'Johan van Wyk', 'Nomsa Dlamini', 'Kagiso Molefe',
            'Zanele Khumalo', 'Pieter Botha', 'Naledi Sithole', 'Bongani Zulu', 'Fatima Hassan',
        ])->map(fn ($name) => User::firstOrCreate(
            ['email' => Str::slug($name, '.').'@example.com'],
            ['name' => $name, 'password' => Hash::make('password1')]
        ));

        // ~30 orders spread over the last 14 days, so both stat periods have data.
        // Status lists repeat some entries so finished orders are the most common.
        $statusesByType = [
            Order::FULFILLMENT_DELIVERY => ['delivered', 'delivered', 'delivered', 'out_for_delivery', 'processing', 'pending', 'pending', 'cancelled'],
            Order::FULFILLMENT_COLLECTION => ['collected', 'collected', 'collected', 'ready_for_collection', 'processing', 'pending', 'pending', 'cancelled'],
        ];

        for ($i = 0; $i < 30; $i++) {
            $createdAt = now()->subDays(rand(0, 13))->subMinutes(rand(0, 1439));
            $type = Order::FULFILLMENT_TYPES[array_rand(Order::FULFILLMENT_TYPES)];

            $order = Order::create([
                'user_id' => $customers->random()->id,
                'fulfillment_type' => $type,
                'status' => $statusesByType[$type][array_rand($statusesByType[$type])],
                'total' => 0,
            ]);

            $total = 0;
            foreach ($products->random(rand(1, 4)) as $product) {
                $qty = rand(1, 3);
                $line = round($product->price * $qty, 2);
                $total += $line;

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit_price' => $product->price,
                    'quantity' => $qty,
                    'line_total' => $line,
                ]);
            }

            $order->forceFill(['total' => $total, 'created_at' => $createdAt, 'updated_at' => $createdAt])->saveQuietly();
        }

        // A payment (or failed attempt) for each new order
        $this->call(DemoPaymentsSeeder::class);
    }
}
