<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('order_item_cut_selections', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_item_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('cut_option_id')
                ->constrained()
                ->restrictOnDelete();

            $table->enum('side', ['A', 'B']);
            $table->enum('quarter', ['front', 'hind']);

            $table->timestamps();

            $table->unique(
                [
                    'order_item_id',
                    'cut_option_id',
                    'side',
                    'quarter',
                ],
                'order_item_cut_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_item_cut_selections');
    }
};
