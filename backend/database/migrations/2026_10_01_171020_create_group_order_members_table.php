<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_order_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_order_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('phone');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_order_members');
    }
};
