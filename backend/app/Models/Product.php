<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    public const TYPE_CARCASS = 'carcass';

    public const TYPE_FIXED_PRICE = 'fixed_price';

    protected $fillable = [
        'name',
        'grade',
        'description',
        'price',
        'image',
        'is_active',
        'category',
        'stock',
        'status',
        'product_type',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'stock' => 'integer',
        'category' => 'array',
    ];

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

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
        return $query
            ->where('is_active', true)
            ->where('status', 'published')
            ->where(function (Builder $query) {
                $query
                    ->where(function (Builder $query) {
                        $query
                            ->where('product_type', self::TYPE_FIXED_PRICE)
                            ->where('stock', '>', 0);
                    })
                    ->orWhere(function (Builder $query) {
                        $query
                            ->where('product_type', self::TYPE_CARCASS)
                            ->whereHas('variants', function (Builder $variants) {
                                $variants
                                    ->where('is_active', true)
                                    ->where('stock', '>', 0);
                            });
                    });
            });
    }

    /** Same rule as scopeAvailable(), for a single product that's already loaded. */
    public function isPurchasable(): bool
    {
        if (! $this->is_active || $this->status !== 'published') {
            return false;
        }

        if ($this->product_type === self::TYPE_FIXED_PRICE) {
            return (int) $this->stock > 0;
        }

        if ($this->product_type === self::TYPE_CARCASS) {
            return $this->variants()
                ->where('is_active', true)
                ->where('stock', '>', 0)
                ->exists();
        }

        return false;
    }
}
