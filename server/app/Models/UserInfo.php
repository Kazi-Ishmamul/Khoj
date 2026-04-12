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
<<<<<<< Updated upstream
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
=======
>>>>>>> Stashed changes
     * Get the user that owns the user info.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
