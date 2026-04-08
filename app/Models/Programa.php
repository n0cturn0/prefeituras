<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Programa extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'programas';

    protected $fillable = [
        'ppa_id',
        'codigo',
        'nome',
        'objetivo',
        'problema',
        'publico_alvo',
        'funcao_codigo',
        'subfuncao_codigo',
        'tipo_programa',
        'responsavel',
        'unidade_gestora',
        'valor_global',
        'fonte_financiamento_fiscal',
        'fonte_financiamento_seguridade',
        'alinhamento_ods',
        'meta_fisica_total',
        'meta_financeira_total',
        'data_inicio',
        'data_fim',
    ];

    protected $casts = [
        'alinhamento_ods' => 'array',
        'data_inicio' => 'date',
        'data_fim' => 'date',
    ];

    public function ppa()
    {
        return $this->belongsTo(Ppa::class);
    }

    public function acoes()
    {
        return $this->hasMany(Acao::class);
    }

    public function indicadores()
    {
        return $this->hasMany(Indicador::class);
    }
}
