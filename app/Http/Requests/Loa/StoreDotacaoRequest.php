<?php

namespace App\Http\Requests\Loa;

use Illuminate\Foundation\Http\FormRequest;

class StoreDotacaoRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'loa_id' => ['required', 'exists:loas,id'],
            'dotacoes' => ['required', 'array', 'min:1'],
            'dotacoes.*.funcao_codigo' => ['required', 'string', 'max:2'],
            'dotacoes.*.subfuncao_codigo' => ['required', 'string', 'max:3'],
            'dotacoes.*.programa_codigo' => ['required', 'string', 'max:10'],
            'dotacoes.*.acao_codigo' => ['required', 'string', 'max:10'],
            'dotacoes.*.unidade_orcamentaria' => ['required', 'string', 'max:100'],
            'dotacoes.*.natureza_despesa' => ['required', 'string', 'max:10'],
            'dotacoes.*.fonte_recursos' => ['required', 'string', 'max:10'],
            'dotacoes.*.valor_dotado' => ['required', 'numeric', 'min:0'],
            'dotacoes.*.projeto_atividade' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'dotacoes.required' => 'É necessário informar ao menos uma dotação (Lei 4.320/64 Art. 2º §2º).',
            'dotacoes.*.funcao_codigo.required' => 'A função é obrigatória (Portaria 42/1999).',
            'dotacoes.*.programa_codigo.required' => 'O programa é obrigatório (integração PPA).',
            'dotacoes.*.valor_dotado.required' => 'O valor da dotação é obrigatório.',
        ];
    }
}
