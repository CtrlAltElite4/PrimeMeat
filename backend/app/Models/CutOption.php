<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CutOption extends Model
{
    protected $fillable = [
        'name',
        'quarter',
        'is_mandatory',
    ];

    protected $casts = [
        'is_mandatory' => 'boolean',
    ];

    public function cartSelections(): HasMany
    {
        return $this->hasMany(CutSelection::class);
    }

    public function orderSelections(): HasMany
    {
        return $this->hasMany(OrderItemCutSelection::class);
    }
}
