<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProtocoloOuvidoria extends Model
{
    protected $fillable = [
        'numero',
        'status',
        'ouvidoria_id',
    ];

    public function ouvidoria()
    {
        return $this->belongsTo(Ouvidoria::class);
    }
}
