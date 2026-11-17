<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GroupOrderProduct extends Model
{
    protected $table = 'group_orders_products';

    protected $fillable = [
        'weight_range',
        'price',
        'stock',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
        'is_active' => 'boolean',
    ];
}
