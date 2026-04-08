<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model AudienciaPublicaLdo
 * Conforme Art. 48 da LRF e Resolução TCE-MS 88/2018.
 * Registro obrigatório das audiências públicas para elaboração da LDO.
 */
class AudienciaPublicaLdo extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'audiencias_publicas_ldo';

    protected $fillable = [
        'ldo_id',
        'data_primeira_convocacao',
        'data_audiencia',
        'local',
        'tipo_meio_comunicacao',
        'nome_veiculo',
        'observacoes',
    ];

    protected $casts = [
        'data_primeira_convocacao' => 'date',
        'data_audiencia' => 'date',
    ];

    public const MEIOS_COMUNICACAO = [
        'diario_oficial' => 'Diário Oficial',
        'jornal_impresso' => 'Jornal Impresso',
        'radio' => 'Rádio',
        'televisao' => 'Televisão',
        'internet' => 'Internet',
        'mural_publico' => 'Mural Público',
        'outro' => 'Outro',
    ];

    public function ldo()
    {
        return $this->belongsTo(Ldo::class);
    }
}
