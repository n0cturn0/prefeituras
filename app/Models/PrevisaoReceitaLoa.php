<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model PrevisaoReceitaLoa
 * Conforme Art. 12 da LRF e Lei 4.320/1964 Art. 2º, §1º.
 * Código de natureza de receita segue classificação SEFAZ-MS / STN.
 */
class PrevisaoReceitaLoa extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'previsao_receitas_loa';

    protected $fillable = [
        'loa_id',
        'codigo_receita',
        'descricao',
        'valor_previsto',
        'valor_constante',
        'valor_realizado_ano_anterior',
    ];

    public function loa()
    {
        return $this->belongsTo(Loa::class);
    }
}
