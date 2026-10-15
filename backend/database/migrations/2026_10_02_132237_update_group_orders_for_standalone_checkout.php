<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('group_orders', function (Blueprint $table) {
            $table->dropForeign(['cart_id']);

            $table->foreignId('cart_id')
                ->nullable()
                ->change();

            $table->string('delivery_method')
                ->default('delivery')
                ->after('number_of_people');

            $table->foreignId('user_id')
                ->nullable()
                ->after('id')
                ->constrained('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('group_orders', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');

            $table->dropColumn('delivery_method');

            $table->foreignId('cart_id')
                ->nullable(false)
                ->change();

            $table->foreign('cart_id')
                ->references('id')
                ->on('carts')
                ->cascadeOnDelete();
        });
    }
};
