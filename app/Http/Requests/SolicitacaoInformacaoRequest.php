<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SolicitacaoInformacaoRequest extends FormRequest
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
            'tipo_pessoa' => 'required|in:fisica,juridica',
            'nome' => 'required|string|max:255',
            'documento' => 'required|string',
            'email' => 'required|email|max:255',
            'telefone' => 'required|string',
            'assunto' => 'required|string',
            'descricao' => 'required|string',
            'forma_recebimento' => 'required|in:email,presencial,correios',
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required' => 'O campo Nome Completo/Razão Social é obrigatório.',
            'documento.required' => 'O campo CPF/CNPJ é obrigatório.',
            'telefone.required' => 'O campo Telefone é obrigatório.',
            'email.required' => 'O campo E-mail é obrigatório.',
            'email.email' => 'Por favor, insira um e-mail válido.',
            'descricao.required' => 'A descrição do pedido é obrigatória.',
        ];
    }
}
