<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupOrderMember extends Model
{
    protected $fillable = [
        'group_order_id',
        'name',
        'email',
        'phone',
    ];

    public function groupOrder(): BelongsTo
    {
        return $this->belongsTo(GroupOrder::class);
    }
}
