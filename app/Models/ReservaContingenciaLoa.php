<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model ReservaContingenciaLoa
 * Conforme Art. 5º, III da LRF.
 * Reserva para atendimento de passivos contingentes e riscos fiscais
 * previstos no Anexo de Riscos Fiscais da LDO.
 */
class ReservaContingenciaLoa extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'reserva_contingencia_loa';

    protected $fillable = [
        'loa_id',
        'descricao',
        'valor_reserva',
    ];

    public function loa()
    {
        return $this->belongsTo(Loa::class);
    }
}
