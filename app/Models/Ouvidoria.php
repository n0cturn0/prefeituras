<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ouvidoria extends Model
{
    protected $fillable = [
        'assunto',
        'departamento',
        'tipo',
        'mensagem',
        'identificacao_tipo',
        'nome',
        'documento',
        'email',
        'estado',
        'cidade',
        'cep',
        'endereco',
        'telefone1',
        'telefone2',
        'ip_address',
        'data_recebimento',
    ];

    public function protocolo()
    {
        return $this->hasOne(ProtocoloOuvidoria::class);
    }
}
