<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomorNotiPreference extends Model
{
    protected $table = 'notification_preferences';

    //Save Customer Preferences
    protected $fillable = [
        'user_id',
        'orders',
        'new_arrivals',
        'special_deals',
        'email_notifications',
    ];

    //Valyes treated as true or false
    protected function casts(): array
    {
        return [
            'orders' => 'boolean',
            'new_arrivals' => 'boolean',
            'special_deals' => 'boolean',
            'email_notifications' => 'boolean',
        ];
    }



    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
