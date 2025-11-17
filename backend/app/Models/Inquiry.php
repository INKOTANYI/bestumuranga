<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inquiry extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'broker_id',
        'listing_id',
        'category_id',
        'details',
        'client_name',
        'client_phone',
        'client_email',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function broker()
    {
        return $this->belongsTo(User::class, 'broker_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
