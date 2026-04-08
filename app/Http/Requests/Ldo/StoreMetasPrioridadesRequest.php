<?php

namespace App\Http\Requests\Ldo;

use Illuminate\Foundation\Http\FormRequest;

class StoreMetasPrioridadesRequest extends FormRequest
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
            'metas.*.acao_codigo' => ['nullable', 'string', 'max:10'],
            'metas.*.descricao' => ['required', 'string'],
            'metas.*.meta_fisica_prevista' => ['nullable', 'numeric', 'min:0'],
            'metas.*.unidade_medida' => ['nullable', 'string', 'max:50'],
            'metas.*.valor_financeiro_previsto' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'metas.required' => 'É necessário informar ao menos uma meta/prioridade (Art. 165 §2º CF/88).',
            'metas.*.valor_financeiro_previsto.required' => 'O valor financeiro previsto é obrigatório.',
        ];
    }
}
