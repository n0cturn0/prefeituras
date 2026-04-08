<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model AnexoCompatibilidadeLoa
 * Conforme Art. 5º, I da LRF e Art. 165, §7º da CF/88.
 * Demonstra a compatibilidade da programação orçamentária
 * com os objetivos do PPA e as metas da LDO.
 */
class AnexoCompatibilidadeLoa extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'anexo_compatibilidade_loa';

    protected $fillable = [
        'loa_id',
        'demonstrativo',
        'objetivo_ppa',
        'meta_ldo',
        'valor_compatibilizado',
    ];

    public function loa()
    {
        return $this->belongsTo(Loa::class);
    }
}
