<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->json('remaining_meat_preferences')
                ->nullable()
                ->after('selected_quarter');
        });

        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropColumn('remaining_meat_preference');
        });
    }

    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->string('remaining_meat_preference')
                ->nullable()
                ->after('selected_quarter');
        });

        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropColumn('remaining_meat_preferences');
        });
    }
};
