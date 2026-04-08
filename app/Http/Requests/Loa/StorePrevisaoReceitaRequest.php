<?php

namespace App\Http\Requests\Loa;

use Illuminate\Foundation\Http\FormRequest;

class StorePrevisaoReceitaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'loa_id' => ['required', 'exists:loas,id'],
            'receitas' => ['required', 'array', 'min:1'],
            'receitas.*.codigo_receita' => ['required', 'string', 'max:20'],
            'receitas.*.descricao' => ['required', 'string'],
            'receitas.*.valor_previsto' => ['required', 'numeric', 'min:0'],
            'receitas.*.valor_constante' => ['nullable', 'numeric'],
            'receitas.*.valor_realizado_ano_anterior' => ['nullable', 'numeric'],
        ];
    }

    public function messages(): array
    {
        return [
            'receitas.required' => 'É necessário informar ao menos uma receita (Art. 12 LRF).',
            'receitas.*.codigo_receita.required' => 'O código de receita é obrigatório.',
            'receitas.*.valor_previsto.required' => 'O valor previsto é obrigatório para cada receita.',
        ];
    }
}
