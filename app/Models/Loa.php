<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model Loa - Lei Orçamentária Anual
 * Conforme Art. 165 §5º CF/88, Art. 5º ao 9º da LC 101/2000 (LRF).
 * Integrada com PPA (via ano_inicio..ano_fim) e LDO (via ano).
 */
class Loa extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'loas';

    protected $fillable = [
        'municipio_id',
        'ano',
        'data_envio_legislativo',
        'data_devolucao_executivo',
        'numero_texto_juridico',
        'ementa',
        'pdf_lei',
        'status',
        'reserva_contingencia_percentual',
    ];

    protected $casts = [
        'data_envio_legislativo' => 'date',
        'data_devolucao_executivo' => 'date',
        'reserva_contingencia_percentual' => 'decimal:2',
    ];

    // --- Relacionamentos com anexos ---

    /** Previsão de Receitas (Art. 12 LRF / Lei 4.320/64) */
    public function previsaoReceitas()
    {
        return $this->hasMany(PrevisaoReceitaLoa::class);
    }

    /** Dotações de Despesa - classificação funcional-programática */
    public function dotacoesDespesas()
    {
        return $this->hasMany(DotacaoDespesaLoa::class);
    }

    /** Compatibilidade com PPA/LDO (Art. 5º, I LRF) */
    public function compatibilidade()
    {
        return $this->hasMany(AnexoCompatibilidadeLoa::class);
    }

    /** Reserva de Contingência (Art. 5º, III LRF) */
    public function reservaContingencia()
    {
        return $this->hasMany(ReservaContingenciaLoa::class);
    }

    // --- Relacionamentos com módulos anteriores ---

    /**
     * LDO do mesmo exercício (Art. 5º, I da LRF — compatibilidade).
     */
    public function ldo()
    {
        return Ldo::where('ano', $this->ano)->first();
    }

    /**
     * PPA vigente no exercício da LOA.
     */
    public function ppaVigente()
    {
        return Ppa::where('ano_inicio', '<=', $this->ano)
                   ->where('ano_fim', '>=', $this->ano)
                   ->first();
    }

    // --- Acessores calculados ---

    /** Total de receitas previstas */
    public function getTotalReceitasAttribute(): float
    {
        return (float) $this->previsaoReceitas()->sum('valor_previsto');
    }

    /** Total de despesas fixadas */
    public function getTotalDespesasAttribute(): float
    {
        return (float) $this->dotacoesDespesas()->sum('valor_dotado');
    }

    /** Total da reserva de contingência */
    public function getTotalReservaAttribute(): float
    {
        return (float) $this->reservaContingencia()->sum('valor_reserva');
    }

    // --- Scopes ---

    public function scopePorAno($query, $ano)
    {
        return $query->where('ano', $ano);
    }

    public function scopeEmVigor($query)
    {
        return $query->where('status', 'aprovado');
    }

    public function scopeComDotacoes($query)
    {
        return $query->has('dotacoesDespesas');
    }
}
