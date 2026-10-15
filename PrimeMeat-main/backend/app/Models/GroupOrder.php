<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GroupOrder extends Model
{
    protected $fillable = [
        'user_id',
        'cart_id',
        'weight_range',
        'price',
        'number_of_people',
        'delivery_method',
        'delivery_member_id',
        'include_ground_beef',
        'address_line_1',
        'address_line_2',
        'city',
        'province',
        'postal_code',
        'delivery_instructions',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'include_ground_beef' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(GroupOrderMember::class);
    }

    public function deliveryMember(): BelongsTo
    {
        return $this->belongsTo(
            GroupOrderMember::class,
            'delivery_member_id'
        );
    }
}
