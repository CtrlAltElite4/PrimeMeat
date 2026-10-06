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
        Schema::create('cut_selections', function (Blueprint $table) {
            $table->id();

            $table->foreignId('cart_item_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('cut_option_id')
                ->constrained()
                ->restrictOnDelete();

            $table->enum('side', ['A', 'B']);
            $table->enum('quarter', ['front', 'hind']);

            $table->timestamps();

            $table->unique([
                'cart_item_id',
                'cut_option_id',
                'side',
                'quarter',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cut_selections');
    }
};
