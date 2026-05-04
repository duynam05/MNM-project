<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $table = 'system_settings';

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'store_name',
        'support_phone',
        'office_address',
        'periodic_email',
        'stock_alert',
        'new_review',
    ];

    protected function casts(): array
    {
        return [
            'periodic_email' => 'boolean',
            'stock_alert' => 'boolean',
            'new_review' => 'boolean',
        ];
    }
}
