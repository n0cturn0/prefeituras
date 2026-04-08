<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model Ldo - Lei de Diretrizes Orçamentárias
 * Conforme Art. 4º da LC 101/2000 (LRF) e Art. 165 §2º da CF/88.
 */
class Ldo extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'ldos';

    protected $fillable = [
        'municipio_id',
        'ano',
        'data_envio_legislativo',
        'data_devolucao_executivo',
        'pdf_lei',
        'ementa',
        'status',
    ];

    protected $casts = [
        'data_envio_legislativo' => 'date',
        'data_devolucao_executivo' => 'date',
    ];

    // --- Relacionamentos ---

    /** Metas Fiscais (Art. 4º, §1º LRF) */
    public function metasFiscais()
    {
        return $this->hasMany(AnexoMetasFiscais::class);
    }

    /** Riscos Fiscais (Art. 4º, §3º LRF) */
    public function riscosFiscais()
    {
        return $this->hasMany(AnexoRiscosFiscais::class);
    }

    /** Audiências Públicas (Art. 48 LRF / TCE-MS 88/2018) */
    public function audienciasPublicas()
    {
        return $this->hasMany(AudienciaPublicaLdo::class);
    }

    /** Metas e Prioridades (Art. 165 §2º CF/88) */
    public function metasPrioridades()
    {
        return $this->hasMany(MetaPrioridadeLdo::class);
    }

    /**
     * Relacionamento com o PPA vigente no ano da LDO.
     * Busca o PPA cujo período (ano_inicio..ano_fim) contém o ano da LDO.
     */
    public function ppaVigente()
    {
        return Ppa::where('ano_inicio', '<=', $this->ano)
                   ->where('ano_fim', '>=', $this->ano)
                   ->first();
    }

    // --- Scopes ---

    public function scopeAprovada($query)
    {
        return $query->where('status', 'aprovado');
    }

    public function scopeDoAno($query, $ano)
    {
        return $query->where('ano', $ano);
    }
}
