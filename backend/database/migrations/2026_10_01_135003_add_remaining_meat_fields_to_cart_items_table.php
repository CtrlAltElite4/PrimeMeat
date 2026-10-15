<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Adds the original single-choice column. 2026_10_01_142540 later replaces it with
     * remaining_meat_preferences (JSON), and 2026_10_01_151343 adds special_instructions.
     */
    public function up(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->string('remaining_meat_preference')->nullable()->after('selected_quarter');
        });
    }

    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropColumn('remaining_meat_preference');
        });
    }
};