<?php

namespace App\Http\Requests\Loa;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLoaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $loa = $this->route('loa');
        return [
            'municipio_id' => ['nullable', 'integer'],
            'ano' => ['required', 'digits:4', 'integer', Rule::unique('loas', 'ano')->ignore($loa)],
            'data_envio_legislativo' => ['nullable', 'date'],
            'data_devolucao_executivo' => ['nullable', 'date', 'after_or_equal:data_envio_legislativo'],
            'numero_texto_juridico' => ['nullable', 'string', 'max:20'],
            'pdf_lei' => ['nullable', 'file', 'mimes:pdf', 'max:15360'],
            'ementa' => ['required', 'string', 'max:3000'],
            'status' => ['required', 'in:em_elaboracao,enviado,aprovado,arquivado'],
            'reserva_contingencia_percentual' => ['nullable', 'numeric', 'min:0', 'max:99.99'],
        ];
    }

    public function messages(): array
    {
        return [
            'ano.unique' => 'Já existe outra LOA para este exercício.',
            'ementa.required' => 'A ementa é obrigatória.',
        ];
    }
}
