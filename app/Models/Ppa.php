<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ppa extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'ppas';

    protected $fillable = [
        'municipio_id',
        'ano_inicio',
        'ano_fim',
        'visao',
        'valores',
        'diretrizes',
        'eixos_estrategicos',
        'status',
        'pdf_lei_ppa',
        'data_aprovacao_lei',
    ];

    protected $casts = [
        'eixos_estrategicos' => 'array',
        'data_aprovacao_lei' => 'date',
    ];

    public function programas()
    {
        return $this->hasMany(Programa::class);
    }

    public function scopeEmVigor($query)
    {
        return $query->where('status', 'em_vigor');
    }
}
