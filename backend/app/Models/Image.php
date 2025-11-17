<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    use HasFactory;

    protected $fillable = [
        'listing_id',
        'file_path',
        'size_mb',
    ];

    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }
}
