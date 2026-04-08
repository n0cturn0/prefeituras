<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OuvidoriaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assunto' => 'required|string|max:255',
            'departamento' => 'nullable|string|max:255',
            'tipo' => 'required|string|max:255',
            'mensagem' => 'required|string',
            'identificacao_tipo' => 'required|in:sem_restricao,com_restricao,anonimo',
            
            // Campos condicionais se não for anônimo
            'nome' => 'required_unless:identificacao_tipo,anonimo|nullable|string|max:255',
            'documento' => 'required_unless:identificacao_tipo,anonimo|nullable|string|max:20',
            'email' => 'required_unless:identificacao_tipo,anonimo|nullable|email|max:255',
            'estado' => 'required_unless:identificacao_tipo,anonimo|nullable|string|max:2',
            'cidade' => 'required_unless:identificacao_tipo,anonimo|nullable|string|max:255',
            'cep' => 'required_unless:identificacao_tipo,anonimo|nullable|string|max:10',
            'endereco' => 'required_unless:identificacao_tipo,anonimo|nullable|string|max:255',
            'telefone1' => 'required_unless:identificacao_tipo,anonimo|nullable|string|max:20',
        ];
    }
    
    public function messages()
    {
        return [
            'required' => 'O campo :attribute é obrigatório.',
            'required_unless' => 'O campo :attribute é obrigatório quando não é anônimo.',
            'email' => 'Informe um e-mail válido.',
        ];
    }
}
