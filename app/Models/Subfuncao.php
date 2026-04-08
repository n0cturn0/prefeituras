<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subfuncao extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'subfuncoes';

    protected $fillable = [
        'funcao_id',
        'codigo',
        'nome',
    ];

    public function funcao()
    {
        return $this->belongsTo(Funcao::class);
    }
}
