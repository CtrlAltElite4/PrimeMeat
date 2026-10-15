<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds admin fields to the team's products table (2026_09_22 migration).
 * Existing columns (name, grade, description, price, image, is_active) are not changed.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('category')->nullable()->after('grade');      // e.g. Full carcass, Beef cuts
            $table->unsignedInteger('stock')->default(0)->after('price');
            // draft = not published yet (hidden from the shop); published = live.
            // Defaults to published so products that already exist stay visible.
            $table->string('status')->default('published')->after('stock');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['category', 'stock', 'status']);
        });
    }
};
