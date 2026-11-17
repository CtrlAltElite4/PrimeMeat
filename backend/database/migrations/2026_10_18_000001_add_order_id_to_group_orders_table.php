<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Links a group order to the order created when the organiser pays for it.
 * Stops the same group order being paid twice and lets the admin panel show it.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('group_orders', function (Blueprint $table) {
            $table->foreignId('order_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('group_orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('order_id');
        });
    }
};
