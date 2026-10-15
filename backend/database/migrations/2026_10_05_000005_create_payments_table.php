<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_number')->nullable()->unique(); // PAY-1001 etc., set after insert
            // restrictOnDelete: an order with payments can't be deleted, so the money trail is never lost
            $table->foreignId('order_id')->constrained()->restrictOnDelete();
            $table->decimal('amount', 10, 2);
            $table->string('status')->default('pending');  // pending, completed, failed
            $table->string('method')->nullable();          // e.g. payfast, card, eft
            $table->string('provider_reference')->nullable(); // the gateway's own ID (e.g. PayFast pf_payment_id)
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
