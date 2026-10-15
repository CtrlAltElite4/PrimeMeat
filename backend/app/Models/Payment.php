<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';

    public const STATUSES = [self::STATUS_PENDING, self::STATUS_COMPLETED, self::STATUS_FAILED];

    protected $fillable = ['order_id', 'amount', 'status', 'method', 'provider_reference', 'paid_at'];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        // Human-friendly payment number based on the ID: 1 -> PAY-1001
        static::created(function (Payment $payment) {
            if (! $payment->payment_number) {
                $payment->payment_number = 'PAY-'.(1000 + $payment->id);
                $payment->saveQuietly();
            }
        });
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
