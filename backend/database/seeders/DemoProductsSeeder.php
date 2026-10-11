<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

/**
 * Fills in category and stock for the sample products, plus a few carcass products,
 * one draft, two low-stock and one unavailable item, so every card on the Products page has data.
 * Development only. Run with: php artisan db:seed --class=DemoProductsSeeder
 * Only touches products that don't have a category yet.
 */
class DemoProductsSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Ribeye Steak' => 'Beef cuts', 'Sirloin Steak' => 'Beef cuts', 'T-Bone Steak' => 'Beef cuts',
            'Beef Mince' => 'Beef cuts', 'Beef Short Rib' => 'Beef cuts', 'Traditional Boerewors' => 'Sausages',
            'Lamb Loin Chops' => 'Lamb', 'Lamb Shank' => 'Lamb', 'Whole Chicken' => 'Chicken',
            'Chicken Thighs' => 'Chicken', 'Pork Belly' => 'Pork', 'Pork Rashers' => 'Pork',
        ];

        Product::whereNull('category')->get()->each(function (Product $p) use ($categories) {
            $p->forceFill([
                'category' => $categories[$p->name] ?? 'Other',
                'stock' => rand(15, 60),
                'status' => 'published',
            ])->save();
        });

        $carcasses = [
            ['Full Carcass', 'AB', 'Full carcass', 'Grade AB full beef carcass. Approx. 230 kg, cut to your cutsheet.', 22500.00],
            ['Full Carcass', 'B', 'Full carcass', 'Grade B full beef carcass. Approx. 220 kg, cut to your cutsheet.', 19000.00],
            ['Half Carcass', 'BB', 'Half carcass', 'Grade B half beef carcass. Approx. 115 kg, cut to your cutsheet.', 9000.00],
        ];
        foreach ($carcasses as [$name, $grade, $category, $description, $price]) {
            Product::firstOrNew(['name' => $name, 'grade' => $grade])->forceFill([
                'category' => $category, 'description' => $description, 'price' => $price,
                'stock' => rand(15, 30), 'status' => 'published', 'is_active' => true,
            ])->save();
        }

        // A spread of states for the cards
        Product::where('name', 'Full Carcass')->where('grade', 'B')->first()?->forceFill(['stock' => 8])->save();
        Product::where('name', 'Lamb Shank')->first()?->forceFill(['stock' => 4])->save();
        Product::where('name', 'Pork Rashers')->first()?->forceFill(['is_active' => false])->save();
        Product::where('name', 'Sirloin Steak')->first()?->forceFill(['status' => 'draft', 'stock' => 0, 'is_active' => false])->save();
    }
}
