<?php

namespace App\Http\Requests\Ldo;

use Illuminate\Foundation\Http\FormRequest;

class StoreAnexoMetasFiscaisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ldo_id' => ['required', 'exists:ldos,id'],
            'metas' => ['required', 'array', 'min:1'],
            'metas.*.tipo_meta' => ['required', 'in:receita_total,receita_primaria,despesa_total,despesa_primaria,resultado_primario,resultado_nominal,divida_publica_consolidada,divida_consolidada_liquida,receitas_previdenciarias,despesas_previdenciarias,resultado_previdenciario'],
            'metas.*.ano_meta' => ['required', 'digits:4', 'integer'],
            'metas.*.valor_previsto' => ['required', 'numeric'],
            'metas.*.valor_constante' => ['nullable', 'numeric'],
            'metas.*.valor_realizado_ano_anterior' => ['nullable', 'numeric'],
        ];
    }

    public function messages(): array
    {
        return [
            'metas.required' => 'É necessário informar ao menos uma meta fiscal (Art. 4º, §1º LRF).',
            'metas.*.tipo_meta.required' => 'O tipo da meta fiscal é obrigatório.',
            'metas.*.valor_previsto.required' => 'O valor previsto é obrigatório para cada meta.',
        ];
    }
}
