<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds the order_item_cut_selections -> order_items link once order_items exists.
 * Skips it on databases that already have the link (built before this fix).
 */
return new class extends Migration
{
    public function up(): void
    {
        if ($this->hasLink()) {
            return;
        }

        Schema::table('order_item_cut_selections', function (Blueprint $table) {
            $table->foreign('order_item_id')->references('id')->on('order_items')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        if (! $this->hasLink()) {
            return;
        }

        Schema::table('order_item_cut_selections', function (Blueprint $table) {
            $table->dropForeign(['order_item_id']);
        });
    }

    private function hasLink(): bool
    {
        return collect(Schema::getForeignKeys('order_item_cut_selections'))
            ->contains(fn ($fk) => $fk['columns'] === ['order_item_id']);
    }
};