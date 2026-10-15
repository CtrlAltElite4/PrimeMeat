<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CutSelection extends Model
{
    protected $fillable = [
        'cart_item_id',
        'cut_option_id',
        'side',
        'quarter',
    ];

    public function cartItem(): BelongsTo
    {
        return $this->belongsTo(CartItem::class);
    }

    public function cutOption(): BelongsTo
    {
        return $this->belongsTo(CutOption::class);
    }
}
