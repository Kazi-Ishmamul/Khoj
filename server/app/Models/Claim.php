<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Claim extends Model
{
    use HasFactory;

    protected $table = 'claims';
    protected $primaryKey = 'claim_id';
    public $timestamps = false;

    protected $fillable = [
        'item_id',
        'claimed_by_id',
        'validity'
    ];

    public function item()
    {
        return $this->belongsTo(Item::class, 'item_id', 'id');
    }

    public function claimedBy()
    {
        return $this->belongsTo(User::class, 'claimed_by_id', 'id');
    }
}
