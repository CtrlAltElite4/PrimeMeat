<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name',
        'grade',
        'description',
        'price',
        'image',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'stock' => 'integer',
    ];

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Products a customer can see and buy: switched on, published (not a draft) and in stock.
     * Use this everywhere the shop lists products, so a sold-out product disappears from the menu.
     */
    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->where('status', '!=', 'draft')
            ->where('stock', '>', 0);
    }

    /** Same rule as scopeAvailable(), for a single product that's already loaded. */
    public function isPurchasable(): bool
    {
        return $this->is_active && $this->status !== 'draft' && (int) $this->stock > 0;
    }
}
