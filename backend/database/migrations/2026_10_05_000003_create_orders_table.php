<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->nullable()->unique(); // set to ORD-1001 etc. after insert
            // nullOnDelete keeps the order history if a customer account is deleted
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('fulfillment_type')->default('delivery'); // delivery or collection
            // pending, processing, ready_for_collection, out_for_delivery, collected, delivered, cancelled
            $table->string('status')->default('pending');
            $table->decimal('total', 10, 2)->default(0);
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
