<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Modelo para logs de auditoria do scraper de PPA externo.
 *
 * Armazena informações sobre cada tentativa de scraping:
 * - URL origem e município
 * - Status (success/failed/partial)
 * - Dados brutos extraídos (JSON)
 * - Contadores de programas/ações/indicadores encontrados
 * - Tempo de processamento
 *
 * @property int $id
 * @property int|null $ppa_id
 * @property string $url
 * @property string $status
 * @property string|null $erro
 * @property array|null $raw_data
 * @property int $programas_encontrados
 * @property int $acoes_encontradas
 * @property int $indicadores_encontrados
 * @property string|null $tipo_conteudo
 * @property string|null $municipio_origem
 * @property int|null $tempo_processamento_ms
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class PpaScraperLog extends Model
{
    use HasFactory;

    protected $table = 'ppa_scraper_logs';

    protected $fillable = [
        'ppa_id',
        'url',
        'status',
        'erro',
        'raw_data',
        'programas_encontrados',
        'acoes_encontradas',
        'indicadores_encontrados',
        'tipo_conteudo',
        'municipio_origem',
        'tempo_processamento_ms',
    ];

    protected $casts = [
        'raw_data' => 'array',
        'tempo_processamento_ms' => 'integer',
        'programas_encontrados' => 'integer',
        'acoes_encontradas' => 'integer',
        'indicadores_encontrados' => 'integer',
    ];

    public function ppa()
    {
        return $this->belongsTo(Ppa::class);
    }

    public function scopeSuccessful($query)
    {
        return $query->where('status', 'success');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }
}
