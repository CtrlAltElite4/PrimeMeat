<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CartItem extends Model
{
    protected $fillable = [
        'cart_id',
        'product_id',
        'quantity',
        'cut_type',
        'selected_quarter',
        'remaining_meat_preferences',
        'special_instructions',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'remaining_meat_preferences' => 'array',
    ];

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function cutSelections(): HasMany
    {
        return $this->hasMany(CutSelection::class);
    }
}
