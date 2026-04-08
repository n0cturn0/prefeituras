<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Funcao extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'funcoes';

    protected $fillable = [
        'codigo',
        'nome',
    ];

    public function subfuncoes()
    {
        return $this->hasMany(Subfuncao::class);
    }
}
