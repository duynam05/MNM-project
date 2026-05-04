<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasUuids;

    protected $table = 'orders';

    protected $fillable = [
        'user_id',
        'total_price',
        'phone',
        'address',
        'latitude',
        'longitude',
        'status',
        'payment_method',
        'payment_status',
        'payment_reference',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'total_price' => 'decimal:2',
            'latitude' => 'float',
            'longitude' => 'float',
            'paid_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function paymentSessions(): HasMany
    {
        return $this->hasMany(PaymentSession::class);
    }
}
