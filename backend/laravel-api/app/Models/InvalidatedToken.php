<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvalidatedToken extends Model
{
    protected $table = 'invalidated_tokens';

    public $incrementing = false;

    protected $primaryKey = 'id';

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'expiry_time',
    ];

    protected function casts(): array
    {
        return [
            'expiry_time' => 'datetime',
        ];
    }
}
