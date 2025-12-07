<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Listing extends Model
{
    protected $fillable = [
        'broker_id',
        'category',
        'purpose',
        'title',
        'city',
        'price',
        'status',
        'bedrooms',
        'area',
        'bathrooms',
        'has_garden',
        'has_kitchen',
        'has_garage',
        'has_cctv',
        'province',
        'district',
        'sector',
        'extra_notes',
        'description',
        'image_path',
        // car-specific attributes
        'make',
        'model',
        'year',
        'mileage',
        'transmission',
        'fuel',
    ];

    public function broker()
    {
        return $this->belongsTo(Broker::class);
    }

    public function images()
    {
        return $this->hasMany(ListingImage::class);
    }
}
