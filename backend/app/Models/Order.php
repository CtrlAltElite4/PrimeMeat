<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    public const FULFILLMENT_DELIVERY = 'delivery';

    public const FULFILLMENT_COLLECTION = 'collection';

    public const FULFILLMENT_TYPES = [
        self::FULFILLMENT_DELIVERY,
        self::FULFILLMENT_COLLECTION,
    ];

    public const STATUS_PENDING = 'pending';

    public const STATUS_PROCESSING = 'processing';

    public const STATUS_READY_FOR_COLLECTION = 'ready_for_collection';

    public const STATUS_OUT_FOR_DELIVERY = 'out_for_delivery';

    public const STATUS_COLLECTED = 'collected';

    public const STATUS_DELIVERED = 'delivered';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_PROCESSING,
        self::STATUS_READY_FOR_COLLECTION,
        self::STATUS_OUT_FOR_DELIVERY,
        self::STATUS_COLLECTED,
        self::STATUS_DELIVERED,
        self::STATUS_CANCELLED,
    ];

    public const COMPLETED_STATUSES = [
        self::STATUS_COLLECTED,
        self::STATUS_DELIVERED,
    ];

    protected $fillable = [
        'user_id',
        'status',
        'total_amount',
        'fulfillment_type',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::created(function (Order $order) {
            if (! $order->order_number) {
                $order->order_number = 'ORD-'.(1000 + $order->id);
                $order->saveQuietly();
            }
        });
    }

    public static function statusesFor(string $fulfillmentType): array
    {
        return $fulfillmentType === self::FULFILLMENT_COLLECTION
            ? [
                self::STATUS_PENDING,
                self::STATUS_PROCESSING,
                self::STATUS_READY_FOR_COLLECTION,
                self::STATUS_COLLECTED,
                self::STATUS_CANCELLED,
            ]
            : [
                self::STATUS_PENDING,
                self::STATUS_PROCESSING,
                self::STATUS_OUT_FOR_DELIVERY,
                self::STATUS_DELIVERED,
                self::STATUS_CANCELLED,
            ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
