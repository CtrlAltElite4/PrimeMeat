<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

/**
 * Loads the team's real product catalogue (ProductSeeder, 84 carcass products)
 * and fills in the admin-only fields that ProductSeeder doesn't know about.
 *
 * Run with: php artisan db:seed --class=PrimeMeatCatalogueSeeder
 *
 * ProductSeeder is the team's file and stays the source of truth for names,
 * grades and prices. This seeder doesn't change it.
 */
class PrimeMeatCatalogueSeeder extends Seeder
{
    /** Stock isn't part of the team's catalogue, so this is a starting value to edit in the admin panel. */
    private const STARTING_STOCK = 20;

    public function run(): void
    {
        // ProductSeeder clears the cart_items table first. If this copy of the project
        // doesn't have that table yet, create an empty stand-in just for the run.
        $madeCartTable = false;
        if (! Schema::hasTable('cart_items')) {
            Schema::create('cart_items', fn (Blueprint $table) => $table->id());
            $madeCartTable = true;
        }

        try {
            // Note: this replaces ALL products with the team's catalogue.
            $this->call(ProductSeeder::class);
        } finally {
            if ($madeCartTable) {
                Schema::dropIfExists('cart_items');
            }
        }

        // Admin fields: category matches the shop filter (Full / Half / Quarter Carcass)
        Product::whereNull('category')->get()->each(function (Product $product) {
            $product->forceFill([
                'category' => $product->name,
                'stock' => $product->stock ?: self::STARTING_STOCK,
                'status' => $product->status ?: 'published',
            ])->save();
        });

        $this->command?->info(Product::count().' products loaded.');
    }
}
