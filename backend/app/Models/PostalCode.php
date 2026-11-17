<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostalCode extends Model
{
    protected $fillable = [
        'code',
        'place_name',
        'latitude',
        'longitude',
        'distance_km',
        'delivery_zone_id',
        'requires_manual_quote',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'distance_km' => 'decimal:2',
        'requires_manual_quote' => 'boolean',
    ];

    public function deliveryZone(): BelongsTo
    {
        return $this->belongsTo(DeliveryZone::class);
    }
}
