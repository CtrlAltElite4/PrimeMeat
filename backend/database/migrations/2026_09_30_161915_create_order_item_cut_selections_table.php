<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The link to order_items is added later, by
     * 2026_10_13_000000_add_order_item_foreign_key_to_order_item_cut_selections_table,
     * because order_items is only created on 2026_10_05.
     */
    public function up(): void
    {
        Schema::create('order_item_cut_selections', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_item_id');

            $table->foreignId('cut_option_id');

            $table->enum('side', ['A', 'B']);
            $table->enum('quarter', ['front', 'hind']);

            $table->timestamps();

            $table->unique(
                ['order_item_id', 'cut_option_id', 'side', 'quarter'],
                'order_item_cut_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_item_cut_selections');
    }
};
