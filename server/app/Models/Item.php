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
        'valid',
        'lat',
        'lng',
    ];

    /**
     * @var array<int, string>
     */
    protected $appends = [
        'qr_scan_url',
        'qr_image_url',
    ];

    protected $hidden = [
        'qr_token',
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

    public function getQrScanUrlAttribute(): ?string
    {
        if (! $this->qr_token) {
            return null;
        }

        return url('/scan/'.$this->qr_token);
    }

    public function getQrImageUrlAttribute(): ?string
    {
        if (! $this->qr_image_path) {
            return null;
        }

        return asset('storage/'.$this->qr_image_path);
    }
}
