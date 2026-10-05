<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('cart_items')->delete();
        DB::table('products')->delete();
        // Full Carcass
        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'C',
            'description' => 'Grade C full beef carcass. Approximate weight: 160 kg.',
            'price' => 15000.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'B',
            'description' => 'Grade B full beef carcass. Approximate weight: 160 kg.',
            'price' => 16000.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB full beef carcass. Approximate weight: 160 kg.',
            'price' => 17000.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'A',
            'description' => 'Grade A full beef carcass. Approximate weight: 160 kg.',
            'price' => 18000.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'C',
            'description' => 'Grade C full beef carcass. Approximate weight: 200 kg.',
            'price' => 15750.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'B',
            'description' => 'Grade B full beef carcass. Approximate weight: 200 kg.',
            'price' => 16750.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB full beef carcass. Approximate weight: 200 kg.',
            'price' => 17750.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'A',
            'description' => 'Grade A full beef carcass. Approximate weight: 200 kg.',
            'price' => 18750.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'C',
            'description' => 'Grade C full beef carcass. Approximate weight: 235 kg.',
            'price' => 16500.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'B',
            'description' => 'Grade B full beef carcass. Approximate weight: 235 kg.',
            'price' => 17500.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB full beef carcass. Approximate weight: 235 kg.',
            'price' => 18500.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'A',
            'description' => 'Grade A full beef carcass. Approximate weight: 235 kg.',
            'price' => 19500.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'C',
            'description' => 'Grade C full beef carcass. Approximate weight: 265 kg.',
            'price' => 17250.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'B',
            'description' => 'Grade B full beef carcass. Approximate weight: 265 kg.',
            'price' => 18250.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB full beef carcass. Approximate weight: 265 kg.',
            'price' => 19250.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'A',
            'description' => 'Grade A full beef carcass. Approximate weight: 265 kg.',
            'price' => 20250.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'C',
            'description' => 'Grade C full beef carcass. Approximate weight: 300 kg.',
            'price' => 18000.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'B',
            'description' => 'Grade B full beef carcass. Approximate weight: 300 kg.',
            'price' => 19000.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB full beef carcass. Approximate weight: 300 kg.',
            'price' => 20000.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'A',
            'description' => 'Grade A full beef carcass. Approximate weight: 300 kg.',
            'price' => 21000.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'C',
            'description' => 'Grade C full beef carcass. Approximate weight: 330 kg.',
            'price' => 19000.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'B',
            'description' => 'Grade B full beef carcass. Approximate weight: 330 kg.',
            'price' => 20000.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB full beef carcass. Approximate weight: 330 kg.',
            'price' => 21000.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'A',
            'description' => 'Grade A full beef carcass. Approximate weight: 330 kg.',
            'price' => 22000.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'C',
            'description' => 'Grade C full beef carcass. Approximate weight: 360 kg.',
            'price' => 21000.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'B',
            'description' => 'Grade B full beef carcass. Approximate weight: 360 kg.',
            'price' => 22250.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB full beef carcass. Approximate weight: 360 kg.',
            'price' => 23500.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Full Carcass',
            'grade' => 'A',
            'description' => 'Grade A full beef carcass. Approximate weight: 360 kg.',
            'price' => 25000.00,
            'image' => null,
            'is_active' => true,
        ]);

        // Half Carcass
        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'C',
            'description' => 'Grade C half beef carcass. Approximate weight: 80 kg.',
            'price' => 8250.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'B',
            'description' => 'Grade B half beef carcass. Approximate weight: 80 kg.',
            'price' => 8800.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB half beef carcass. Approximate weight: 80 kg.',
            'price' => 9350.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'A',
            'description' => 'Grade A half beef carcass. Approximate weight: 80 kg.',
            'price' => 9900.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'C',
            'description' => 'Grade C half beef carcass. Approximate weight: 100 kg.',
            'price' => 8650.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'B',
            'description' => 'Grade B half beef carcass. Approximate weight: 100 kg.',
            'price' => 9200.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB half beef carcass. Approximate weight: 100 kg.',
            'price' => 9750.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'A',
            'description' => 'Grade A half beef carcass. Approximate weight: 100 kg.',
            'price' => 10300.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'C',
            'description' => 'Grade C half beef carcass. Approximate weight: 118 kg.',
            'price' => 9100.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'B',
            'description' => 'Grade B half beef carcass. Approximate weight: 118 kg.',
            'price' => 9650.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB half beef carcass. Approximate weight: 118 kg.',
            'price' => 10200.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'A',
            'description' => 'Grade A half beef carcass. Approximate weight: 118 kg.',
            'price' => 10725.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'C',
            'description' => 'Grade C half beef carcass. Approximate weight: 133 kg.',
            'price' => 9500.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'B',
            'description' => 'Grade B half beef carcass. Approximate weight: 133 kg.',
            'price' => 10050.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB half beef carcass. Approximate weight: 133 kg.',
            'price' => 10600.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'A',
            'description' => 'Grade A half beef carcass. Approximate weight: 133 kg.',
            'price' => 11150.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'C',
            'description' => 'Grade C half beef carcass. Approximate weight: 150 kg.',
            'price' => 9900.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'B',
            'description' => 'Grade B half beef carcass. Approximate weight: 150 kg.',
            'price' => 10450.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB half beef carcass. Approximate weight: 150 kg.',
            'price' => 11000.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'A',
            'description' => 'Grade A half beef carcass. Approximate weight: 150 kg.',
            'price' => 11550.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'C',
            'description' => 'Grade C half beef carcass. Approximate weight: 165 kg.',
            'price' => 10450.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'B',
            'description' => 'Grade B half beef carcass. Approximate weight: 165 kg.',
            'price' => 11000.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB half beef carcass. Approximate weight: 165 kg.',
            'price' => 11550.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'A',
            'description' => 'Grade A half beef carcass. Approximate weight: 165 kg.',
            'price' => 12100.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'C',
            'description' => 'Grade C half beef carcass. Approximate weight: 180 kg.',
            'price' => 11550.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'B',
            'description' => 'Grade B half beef carcass. Approximate weight: 180 kg.',
            'price' => 12250.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB half beef carcass. Approximate weight: 180 kg.',
            'price' => 12925.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Half Carcass',
            'grade' => 'A',
            'description' => 'Grade A half beef carcass. Approximate weight: 180 kg.',
            'price' => 13750.00,
            'image' => null,
            'is_active' => true,
        ]);

        // Quarter Carcass
        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'C',
            'description' => 'Grade C quarter beef carcass. Approximate weight: 40 kg.',
            'price' => 4200.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'B',
            'description' => 'Grade B quarter beef carcass. Approximate weight: 40 kg.',
            'price' => 4480.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB quarter beef carcass. Approximate weight: 40 kg.',
            'price' => 4760.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'A',
            'description' => 'Grade A quarter beef carcass. Approximate weight: 40 kg.',
            'price' => 5040.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'C',
            'description' => 'Grade C quarter beef carcass. Approximate weight: 50 kg.',
            'price' => 4410.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'B',
            'description' => 'Grade B quarter beef carcass. Approximate weight: 50 kg.',
            'price' => 4690.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB quarter beef carcass. Approximate weight: 50 kg.',
            'price' => 4970.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'A',
            'description' => 'Grade A quarter beef carcass. Approximate weight: 50 kg.',
            'price' => 5250.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'C',
            'description' => 'Grade C quarter beef carcass. Approximate weight: 59 kg.',
            'price' => 4620.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'B',
            'description' => 'Grade B quarter beef carcass. Approximate weight: 59 kg.',
            'price' => 4900.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB quarter beef carcass. Approximate weight: 59 kg.',
            'price' => 5180.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'A',
            'description' => 'Grade A quarter beef carcass. Approximate weight: 59 kg.',
            'price' => 5460.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'C',
            'description' => 'Grade C quarter beef carcass. Approximate weight: 67 kg.',
            'price' => 4830.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'B',
            'description' => 'Grade B quarter beef carcass. Approximate weight: 67 kg.',
            'price' => 5110.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB quarter beef carcass. Approximate weight: 67 kg.',
            'price' => 5390.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'A',
            'description' => 'Grade A quarter beef carcass. Approximate weight: 67 kg.',
            'price' => 5670.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'C',
            'description' => 'Grade C quarter beef carcass. Approximate weight: 75 kg.',
            'price' => 5040.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'B',
            'description' => 'Grade B quarter beef carcass. Approximate weight: 75 kg.',
            'price' => 5320.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB quarter beef carcass. Approximate weight: 75 kg.',
            'price' => 5600.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'A',
            'description' => 'Grade A quarter beef carcass. Approximate weight: 75 kg.',
            'price' => 5880.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'C',
            'description' => 'Grade C quarter beef carcass. Approximate weight: 83 kg.',
            'price' => 5320.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'B',
            'description' => 'Grade B quarter beef carcass. Approximate weight: 83 kg.',
            'price' => 5600.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB quarter beef carcass. Approximate weight: 83 kg.',
            'price' => 5880.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'A',
            'description' => 'Grade A quarter beef carcass. Approximate weight: 83 kg.',
            'price' => 6160.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'C',
            'description' => 'Grade C quarter beef carcass. Approximate weight: 90 kg.',
            'price' => 5880.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'B',
            'description' => 'Grade B quarter beef carcass. Approximate weight: 90 kg.',
            'price' => 6230.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'AB',
            'description' => 'Grade AB quarter beef carcass. Approximate weight: 90 kg.',
            'price' => 6580.00,
            'image' => null,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Quarter Carcass',
            'grade' => 'A',
            'description' => 'Grade A quarter beef carcass. Approximate weight: 90 kg.',
            'price' => 7000.00,
            'image' => null,
            'is_active' => true,
        ]);
    }
}
