<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminNotificationPreference extends Model
{
    /** The five alert types, with their default (on/off) for admins who haven't saved yet. */
    public const DEFAULTS = [
        'new_orders' => true,
        'payment_updates' => true,
        'new_users' => false,
        'system_alerts' => true,
        'stock_alerts' => true,
    ];

    protected $fillable = ['user_id', 'new_orders', 'payment_updates', 'new_users', 'system_alerts', 'stock_alerts'];

    protected $casts = [
        'new_orders' => 'boolean',
        'payment_updates' => 'boolean',
        'new_users' => 'boolean',
        'system_alerts' => 'boolean',
        'stock_alerts' => 'boolean',
    ];

    /** An admin's current choices, falling back to the defaults. */
    public static function forUser(int $userId): array
    {
        $row = static::where('user_id', $userId)->first();

        return $row ? $row->only(array_keys(self::DEFAULTS)) : self::DEFAULTS;
    }
}
