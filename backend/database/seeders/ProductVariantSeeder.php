<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;

class ProductVariantSeeder extends Seeder
{
    public function run(): void
    {
        $seedBeef = function ($productName, $bands) {
            $product = Product::where('name', $productName)->firstOrFail();

            foreach ($bands as [$min, $max, $c, $b, $ab, $a]) {
                foreach ([
                    'C' => $c,
                    'B' => $b,
                    'AB' => $ab,
                    'A' => $a,
                ] as $grade => $price) {
                    ProductVariant::updateOrCreate(
                        [
                            'product_id' => $product->id,
                            'grade' => $grade,
                            'weight_min_kg' => $min,
                            'weight_max_kg' => $max,
                        ],
                        [
                            'price' => $price,
                            'stock' => 20,
                            'is_active' => true,
                        ]
                    );
                }
            }
        };

        $seedOtherCarcass = function ($productName, $bands) {
            $product = Product::where('name', $productName)->firstOrFail();

            foreach ($bands as [$min, $max, $price]) {
                ProductVariant::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'grade' => null,
                        'weight_min_kg' => $min,
                        'weight_max_kg' => $max,
                    ],
                    [
                        'price' => $price,
                        'stock' => 20,
                        'is_active' => true,
                    ]
                );
            }
        };

        // FULL BEEF CARCASS
        $seedBeef('Full Beef Carcass', [
            [200, 224, 15000, 15800, 16600, 17500],
            [225, 249, 17500, 18300, 19100, 20000],
            [250, 274, 20000, 20800, 21600, 22500],
            [275, 300, 22500, 23300, 24100, 25000],
        ]);

        // HALF BEEF CARCASS
        $seedBeef('Half Beef Carcass', [
            [100, 112, 7500, 7900, 8300, 8750],
            [112.5, 124.5, 8750, 9150, 9550, 10000],
            [125, 137, 10000, 10400, 10800, 11250],
            [137.5, 150, 11250, 11650, 12050, 12500],
        ]);

        // QUARTER BEEF CARCASS
        $seedBeef('Quarter Beef Carcass', [
            [50, 56, 3750, 3950, 4150, 4375],
            [56.25, 62.25, 4375, 4575, 4775, 5000],
            [62.5, 68.5, 5000, 5200, 5400, 5625],
            [68.75, 75, 5625, 5825, 6025, 6250],
        ]);

        // MUTTON CARCASS
        $seedOtherCarcass('Mutton Carcass', [
            [18, 22, 2728],
            [22, 26, 3224],
            [26, 30, 3720],
        ]);

        // LAMB CARCASS
        $seedOtherCarcass('Lamb Carcass', [
            [18, 22, 3278],
            [22, 26, 3874],
        ]);
    }
}
