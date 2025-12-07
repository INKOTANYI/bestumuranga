<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Broker extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'is_active',
    ];
}
