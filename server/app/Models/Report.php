<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $table = 'reports';
    protected $primaryKey = 'report_id';
    public $timestamps = false;

    protected $fillable = [
        'item_id',
        'r_user_id',
        'reason',
        'status'
    ];

    protected $casts = [
        'created_at' => 'datetime'
    ];

    /**
     * Get the item being reported
     */
    public function item()
    {
        return $this->belongsTo(Item::class, 'item_id', 'id');
    }

    /**
     * Get the user who reported
     */
    public function reportedBy()
    {
        return $this->belongsTo(User::class, 'r_user_id', 'id');
    }

    /**
     * Scope: Get pending reports
     */
    public function scopePending($query)
    {
        return $query->where('status', 0);
    }

    /**
     * Scope: Get struck reports
     */
    public function scopeStruck($query)
    {
        return $query->where('status', -1);
    }

    /**
     * Scope: Get dismissed reports
     */
    public function scopeDismissed($query)
    {
        return $query->where('status', 1);
    }
}
