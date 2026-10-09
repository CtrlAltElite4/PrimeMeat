<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('group_orders', function (Blueprint $table) {
            $table->string('address_line_1')->nullable()->change();
            $table->string('address_line_2')->nullable()->change();
            $table->string('city')->nullable()->change();
            $table->string('province')->nullable()->change();
            $table->string('postal_code')->nullable()->change();
            $table->text('delivery_instructions')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('group_orders', function (Blueprint $table) {
            $table->string('address_line_1')->nullable(false)->change();
            $table->string('address_line_2')->nullable(false)->change();
            $table->string('city')->nullable(false)->change();
            $table->string('province')->nullable(false)->change();
            $table->string('postal_code')->nullable(false)->change();
            $table->text('delivery_instructions')->nullable(false)->change();
        });
    }
};
