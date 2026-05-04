<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReviewReply extends Model
{
    use HasUuids;

    protected $table = 'review_reply';

    protected $fillable = [
        'review_id',
        'parent_reply_id',
        'user_id',
        'content',
    ];

    public function review(): BelongsTo
    {
        return $this->belongsTo(Review::class);
    }

    public function parentReply(): BelongsTo
    {
        return $this->belongsTo(ReviewReply::class, 'parent_reply_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(ReviewReply::class, 'parent_reply_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
