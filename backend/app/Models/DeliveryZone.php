<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeliveryZone extends Model
{
    protected $fillable = [
        'zone_number',
        'min_distance_km',
        'max_distance_km',
        'normal_fee',
        'is_active',
    ];

    protected $casts = [
        'min_distance_km' => 'decimal:2',
        'max_distance_km' => 'decimal:2',
        'normal_fee' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function postalCodes(): HasMany
    {
        return $this->hasMany(PostalCode::class);
    }
}
