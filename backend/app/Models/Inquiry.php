<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inquiry extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'category',
        'purpose',
        'bedrooms',
        'bathrooms',
        'location',
        'make',
        'model',
        'year',
        'mileage',
        'amount',
        'status',
        'return_date',
        'description',
    ];
}
