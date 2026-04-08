<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model AnexoRiscosFiscais
 * Conforme Art. 4º, §3º da LC 101/2000 (LRF).
 * Avaliação dos passivos contingentes e riscos fiscais.
 */
class AnexoRiscosFiscais extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'anexo_riscos_fiscais';

    protected $fillable = [
        'ldo_id',
        'descricao',
        'valor_estimado',
        'providencia',
    ];

    public function ldo()
    {
        return $this->belongsTo(Ldo::class);
    }
}
