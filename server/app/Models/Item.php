<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'item_name',
        'category',
        'description',
        'date_time',
        'location',
        'status',
        'contact_info',
        'item_image_url',
        'resolution_status',
        'valid'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function claims()
    {
        return $this->hasMany(Claim::class, 'item_id', 'id');
    }

    public function reports()
    {
        return $this->hasMany(Report::class, 'item_id', 'id');
    }
}
