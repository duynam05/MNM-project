<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Review extends Model
{
    use HasUuids;

    protected $table = 'review';

    protected $fillable = [
        'book_id',
        'user_id',
        'rating',
        'content',
        'status',
        'verified_purchase',
        'admin_reply',
        'customer_reply',
        'replied_at',
        'customer_replied_at',
    ];

    protected function casts(): array
    {
        return [
            'verified_purchase' => 'boolean',
            'replied_at' => 'datetime',
            'customer_replied_at' => 'datetime',
        ];
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function replies(): HasMany
    {
        return $this->hasMany(ReviewReply::class)->orderBy('created_at');
    }
}
