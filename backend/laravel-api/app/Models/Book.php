<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasUuids;

    protected $fillable = [
        'title',
        'author',
        'category',
        'price',
        'rating',
        'stock',
        'image',
    ];
}
