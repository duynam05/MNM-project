<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentSession extends Model
{
    use HasUuids;

    protected $table = 'payment_session';

    protected $fillable = [
        'order_id',
        'provider',
        'status',
        'amount',
        'reference',
        'qr_url',
        'payment_url',
        'provider_transaction_id',
        'provider_order_code',
        'provider_payment_link_id',
        'callback_token',
        'expires_at',
        'confirmed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'provider_order_code' => 'integer',
            'expires_at' => 'datetime',
            'confirmed_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
