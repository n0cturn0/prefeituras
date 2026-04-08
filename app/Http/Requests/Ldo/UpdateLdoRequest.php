<?php

namespace App\Http\Requests\Ldo;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLdoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $ldo = $this->route('ldo');
        return [
            'municipio_id' => ['nullable', 'integer'],
            'ano' => ['required', 'digits:4', 'integer', Rule::unique('ldos', 'ano')->ignore($ldo)],
            'data_envio_legislativo' => ['nullable', 'date'],
            'data_devolucao_executivo' => ['nullable', 'date', 'after_or_equal:data_envio_legislativo'],
            'pdf_lei' => ['nullable', 'file', 'mimes:pdf', 'max:15360'],
            'ementa' => ['required', 'string', 'max:3000'],
            'status' => ['required', 'in:em_elaboracao,enviado,aprovado,arquivado'],
        ];
    }

    public function messages(): array
    {
        return [
            'ano.unique' => 'Já existe outra LDO cadastrada para este ano.',
            'ementa.required' => 'A ementa da lei é obrigatória.',
        ];
    }
}
