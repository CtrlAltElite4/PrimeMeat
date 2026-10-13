<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class helpfaq extends Model
{
    //
protected $fillable =[
'category',
'title',
'answer',
'keywords'
];


protected $casts = ['keywords'=>'array'];
}
