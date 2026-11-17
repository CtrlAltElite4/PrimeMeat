<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('group_orders', function (Blueprint $table) {
            $table->foreignId('group_order_product_id')
                ->nullable()
                ->after('user_id')
                ->constrained('group_orders_products')
                ->nullOnDelete();

            $table->boolean('stock_reserved')
                ->default(false)
                ->after('price');

            $table->timestamp('stock_reserved_at')
                ->nullable()
                ->after('stock_reserved');
        });
    }

    public function down(): void
    {
        Schema::table('group_orders', function (Blueprint $table) {
            $table->dropForeign(['group_order_product_id']);
            $table->dropColumn([
                'group_order_product_id',
                'stock_reserved',
                'stock_reserved_at',
            ]);
        });
    }
};
