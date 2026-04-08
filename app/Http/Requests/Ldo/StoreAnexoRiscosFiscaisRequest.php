<?php

namespace App\Http\Requests\Ldo;

use Illuminate\Foundation\Http\FormRequest;

class StoreAnexoRiscosFiscaisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ldo_id' => ['required', 'exists:ldos,id'],
            'riscos' => ['required', 'array', 'min:1'],
            'riscos.*.descricao' => ['required', 'string'],
            'riscos.*.valor_estimado' => ['required', 'numeric', 'min:0'],
            'riscos.*.providencia' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'riscos.required' => 'É necessário informar ao menos um risco fiscal (Art. 4º, §3º LRF).',
            'riscos.*.providencia.required' => 'A providência é obrigatória para cada risco identificado.',
        ];
    }
}
