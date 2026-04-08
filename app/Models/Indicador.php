<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Indicador extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'indicadores';

    protected $fillable = [
        'programa_id',
        'acao_id',
        'nome',
        'formula',
        'unidade_medida',
        'meta_ano1',
        'meta_ano2',
        'meta_ano3',
        'meta_ano4',
        'peso',
    ];

    public function programa()
    {
        return $this->belongsTo(Programa::class);
    }

    public function acao()
    {
        return $this->belongsTo(Acao::class);
    }
}
