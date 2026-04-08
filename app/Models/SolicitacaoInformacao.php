<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SolicitacaoInformacao extends Model
{
    protected $fillable = [
        'tipo_pessoa',
        'nome',
        'documento',
        'email',
        'telefone',
        'endereco',
        'assunto',
        'descricao',
        'forma_recebimento',
        'ip_address',
        'data_recebimento',
    ];

    public function protocolo()
    {
        return $this->hasOne(Protocolo::class);
    }
}
