<?php

namespace App\Http\Requests\Ppa;

use Illuminate\Foundation\Http\FormRequest;

class ImportMetasFinanceirasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'portal_url' => ['required', 'url'],
            'ano' => ['required', 'digits:4', 'integer', 'min:2010', 'max:2099'],
        ];
    }

    public function messages(): array
    {
        return [
            'portal_url.required' => 'Informe a URL do portal de transparência.',
            'portal_url.url' => 'URL inválida.',
            'ano.required' => 'Selecione o ano.',
            'ano.digits' => 'Ano deve ter 4 dígitos.',
            'ano.integer' => 'Ano inválido.',
            'ano.min' => 'Ano deve ser 2010 ou superior.',
            'ano.max' => 'Ano inválido.',
        ];
    }
}
