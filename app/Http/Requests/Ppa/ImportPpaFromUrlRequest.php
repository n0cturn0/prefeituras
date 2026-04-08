<?php

namespace App\Http\Requests\Ppa;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validação para importação de PPA via URL externa.
 *
 * Regras de validação:
 * - URL deve ser válida e acessível
 * - Aceita apenas URLs HTTP/HTTPS
 * - Não permite URLs de localhost em produção
 */
class ImportPpaFromUrlRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Verifica se o usuário está autenticado e tem permissão para gerenciar PPAs
        if (! $this->user()) {
            return false;
        }

        return $this->user()->hasAnyRole(['Admin', 'Gestor']);
    }

    public function rules(): array
    {
        return [
            'url' => [
                'required',
                'url',
                'starts_with:http://,https://',
            ],
            'dry_run' => [
                'nullable',
                'boolean',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'url.required' => 'A URL do PPA externo é obrigatória.',
            'url.url' => 'Forneça uma URL válida (ex: https://exemplo.com/ppa.pdf).',
            'url.starts_with' => 'A URL deve começar com http:// ou https://.',
            'url.regex' => 'A URL deve apontar para um arquivo PDF ou página HTML de PPA.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Verificar se é URL de localhost (somente em produção)
            if (app()->environment('production')) {
                $host = parse_url($this->url, PHP_URL_HOST);
                if (in_array($host, ['localhost', '127.0.0.1', '::1'])) {
                    $validator->errors()->add('url', 'URLs localhost não são permitidas em produção.');
                }
            }
        });
    }

    /**
     * Handle a failed authorization attempt.
     * Retorna JSON em vez de redirecionar para login.
     */
    protected function failedAuthorization()
    {
        abort(response()->json([
            'success' => false,
            'error' => 'Acesso negado. Você precisa estar logado com perfil Admin ou Gestor.',
        ], 403));
    }
}
