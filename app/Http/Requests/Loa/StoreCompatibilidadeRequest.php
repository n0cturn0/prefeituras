<?php

namespace App\Http\Requests\Loa;

use Illuminate\Foundation\Http\FormRequest;

class StoreCompatibilidadeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'loa_id' => ['required', 'exists:loas,id'],
            'itens' => ['required', 'array', 'min:1'],
            'itens.*.demonstrativo' => ['required', 'string'],
            'itens.*.objetivo_ppa' => ['nullable', 'string'],
            'itens.*.meta_ldo' => ['nullable', 'string'],
            'itens.*.valor_compatibilizado' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'itens.required' => 'É necessário demonstrar compatibilidade com PPA/LDO (Art. 5º, I LRF).',
        ];
    }
}
