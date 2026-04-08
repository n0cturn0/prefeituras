<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model MetaPrioridadeLdo
 * Conforme Art. 165, §2º da CF/88.
 * Vinculação opcional com ações do PPA (Portaria 42/1999).
 */
class MetaPrioridadeLdo extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'metas_prioridades_ldo';

    protected $fillable = [
        'ldo_id',
        'acao_codigo',
        'funcao_codigo',
        'subfuncao_codigo',
        'descricao',
        'meta_fisica_prevista',
        'unidade_medida',
        'valor_financeiro_previsto',
        'valor_empenhado',
        'valor_liquidado',
        'valor_pago',
    ];

    public function ldo()
    {
        return $this->belongsTo(Ldo::class);
    }
}
