<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Each admin's email alert choices (Settings > Notification).
 * One row per admin. An admin without a row gets the defaults in AdminNotificationPreference.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->boolean('new_orders')->default(true);
            $table->boolean('payment_updates')->default(true);
            $table->boolean('new_users')->default(false);
            $table->boolean('system_alerts')->default(true);
            $table->boolean('stock_alerts')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_notification_preferences');
    }
};
