<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Acao extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'acoes';

    protected $fillable = [
        'programa_id',
        'codigo',
        'nome',
        'descricao',
        'iniciativa',
        'objetivo_especifico',
        'produto',
        'unidade_medida',
        'beneficiario',
        'meta_fisica_ano1',
        'meta_fisica_ano2',
        'meta_fisica_ano3',
        'meta_fisica_ano4',
        'valor_global_acao',
        'funcao_codigo',
        'subfuncao_codigo',
    ];

    public function programa()
    {
        return $this->belongsTo(Programa::class);
    }

    public function indicadores()
    {
        return $this->hasMany(Indicador::class);
    }
}
