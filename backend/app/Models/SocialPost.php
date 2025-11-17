<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SocialPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'listing_id',
        'platform',
        'status',
        'share_id',
        'media_urls',
    ];

    protected $casts = [
        'media_urls' => 'array',
    ];
}
