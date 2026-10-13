
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->nullable();
            $table->string('grade')->nullable();
            $table->string('cut_type')->nullable();
            $table->string('selected_quarter')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn([
                'price',
                'grade',
                'cut_type',
                'selected_quarter',
            ]);
        });
    }
};
