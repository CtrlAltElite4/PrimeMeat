<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItemCutSelection extends Model
{
    protected $fillable = [
        'order_item_id',
        'cut_option_id',
        'side',
        'quarter',
    ];

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function cutOption(): BelongsTo
    {
        return $this->belongsTo(CutOption::class);
    }
}
