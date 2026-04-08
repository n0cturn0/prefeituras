<?php

namespace App\Http\Requests\Ppa;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validação para importação de PPA via Portal QualitySistemas.
 */
class ImportPpaFromPortalRequest extends FormRequest
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
        ];
    }

    public function messages(): array
    {
        return [
            'portal_url.required' => 'A URL do portal de transparência é obrigatória.',
            'portal_url.url' => 'Forneça uma URL válida.',
            'portal_url.starts_with' => 'A URL deve começar com http:// ou https://.',
            'portal_url.regex' => 'A URL deve ser de um portal QualitySistemas.',
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
