<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'A',
            'description' => 'Grade A full beef carcass. Approximate weight: 520 kg.',
            'price' => 25000.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB full beef carcass. Approximate weight: 480 kg.',
            'price' => 22500.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'B',
            'description' => 'Grade B full beef carcass. Approximate weight: 440 kg.',
            'price' => 19000.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'C',
            'description' => 'Grade C full beef carcass. Approximate weight: 400 kg.',
            'price' => 15000.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'A',
            'description' => 'Grade A half beef carcass. Approximate weight: 260 kg.',
            'price' => 12500.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB half beef carcass. Approximate weight: 240 kg.',
            'price' => 11250.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'B',
            'description' => 'Grade B half beef carcass. Approximate weight: 220 kg.',
            'price' => 9500.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'C',
            'description' => 'Grade C half beef carcass. Approximate weight: 200 kg.',
            'price' => 7500.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'A',
            'description' => 'Grade A quarter beef carcass. Approximate weight: 130 kg.',
            'price' => 6250.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB quarter beef carcass. Approximate weight: 120 kg.',
            'price' => 5625.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'B',
            'description' => 'Grade B quarter beef carcass. Approximate weight: 110 kg.',
            'price' => 4750.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'C',
            'description' => 'Grade C quarter beef carcass. Approximate weight: 100 kg.',
            'price' => 3750.00,
            'image' => null,
            'is_active' => true,
        ]);
    }
}