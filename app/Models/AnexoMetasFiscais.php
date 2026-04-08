<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model AnexoMetasFiscais
 * Conforme Art. 4º, §1º da LC 101/2000 (LRF).
 * Demonstrativo de metas anuais em valores correntes e constantes.
 */
class AnexoMetasFiscais extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'anexo_metas_fiscais';

    protected $fillable = [
        'ldo_id',
        'tipo_meta',
        'ano_meta',
        'valor_previsto',
        'valor_constante',
        'valor_realizado_ano_anterior',
    ];

    /**
     * Labels legíveis para os tipos de meta fiscal, conforme LRF.
     */
    public const TIPOS_META = [
        'receita_total' => 'Receita Total',
        'receita_primaria' => 'Receita Primária',
        'despesa_total' => 'Despesa Total',
        'despesa_primaria' => 'Despesa Primária',
        'resultado_primario' => 'Resultado Primário',
        'resultado_nominal' => 'Resultado Nominal',
        'divida_publica_consolidada' => 'Dívida Pública Consolidada',
        'divida_consolidada_liquida' => 'Dívida Consolidada Líquida',
        'receitas_previdenciarias' => 'Receitas Previdenciárias',
        'despesas_previdenciarias' => 'Despesas Previdenciárias',
        'resultado_previdenciario' => 'Resultado Previdenciário',
    ];

    public function ldo()
    {
        return $this->belongsTo(Ldo::class);
    }

    /** Retorna o label legível do tipo de meta */
    public function getTipoMetaLabelAttribute(): string
    {
        return self::TIPOS_META[$this->tipo_meta] ?? $this->tipo_meta;
    }
}
