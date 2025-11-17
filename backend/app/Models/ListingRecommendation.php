<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ListingRecommendation extends Model
{
    use HasFactory;

    protected $fillable = [
        'listing_id',
        'recommended_listing_id',
        'score',
    ];
}
