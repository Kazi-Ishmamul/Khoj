<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserInfo extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'user_info';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'bio',
        'fb_url',
        'x_url',
        'insta_url',
        'linkedin_url',
    ];

    /**
     * The accessors to append to model arrays.
     *
     * @var array
     */
    protected $appends = [
        'items_lost_count',
        'items_found_count',
        'report_strikes',
        'wallet_balance',
    ];

    /**
     * Get the user that owns the user info.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get items lost count - active lost items (not resolved).
     * 
     * @return int
     */
    public function getItemsLostCountAttribute()
    {
        return Item::where('user_id', $this->user_id)
            ->where('status', 'lost')
            ->where('resolution_status', '!=', 'resolved')
            ->count();
    }

    /**
     * Get items found count - active found items (not resolved).
     * 
     * @return int
     */
    public function getItemsFoundCountAttribute()
    {
        return Item::where('user_id', $this->user_id)
            ->where('status', 'found')
            ->where('resolution_status', '!=', 'resolved')
            ->count();
    }

    /**
     * Get report strikes count - reports against user's items that were marked as struck (fake).
     * 
     * @return int
     */
    public function getReportStrikesAttribute()
    {
        return Report::whereHas('item', function ($query) {
            $query->where('user_id', $this->user_id);
        })
        ->where('status', -1)
        ->count();
    }
}
