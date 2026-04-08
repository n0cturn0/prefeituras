<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Protocolo extends Model
{
    protected $fillable = [
        'numero',
        'status',
        'solicitacao_informacao_id',
    ];

    public function solicitacaoInformacao()
    {
        return $this->belongsTo(SolicitacaoInformacao::class);
    }
}
