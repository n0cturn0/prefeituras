<?php

namespace App\Http\Requests\Ldo;

use Illuminate\Foundation\Http\FormRequest;

class ImportLdoFromPortalRequest extends FormRequest
{
    public function authorize(): bool
    {
        if (! $this->user()) {
            return false;
        }

        return $this->user()->hasAnyRole(['Admin', 'Gestor']);
    }

    public function rules(): array
    {
        return [
            'portal_url' => [
                'required',
                'url',
                'starts_with:http://,https://',
                'regex:/qualitysistemas/i',
            ],
            'ano' => [
                'nullable',
                'integer',
                'digits:4',
                'between:2000,2100',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'portal_url.required' => 'A URL do portal de transparência é obrigatória.',
            'portal_url.url' => 'Forneça uma URL válida.',
            'portal_url.starts_with' => 'A URL deve começar com http:// ou https://.',
            'portal_url.regex' => 'A URL deve ser de um portal QualitySistemas.',
            'ano.integer' => 'O ano deve ser um número válido.',
            'ano.digits' => 'O ano deve ter 4 dígitos.',
            'ano.between' => 'O ano deve estar entre 2000 e 2100.',
        ];
    }

    protected function failedAuthorization()
    {
        abort(response()->json([
            'success' => false,
            'error' => 'Acesso negado. Você precisa estar logado com perfil Admin ou Gestor.',
        ], 403));
    }
}
