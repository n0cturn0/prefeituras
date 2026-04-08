<?php

namespace App\Http\Requests\Loa;

use Illuminate\Foundation\Http\FormRequest;

class StoreLoaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'municipio_id' => ['nullable', 'integer'],
            'ano' => ['required', 'digits:4', 'integer', 'unique:loas,ano'],
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
            'ano.unique' => 'Já existe uma LOA cadastrada para este exercício.',
            'ano.required' => 'O exercício financeiro é obrigatório (Art. 165 §5º CF).',
            'ementa.required' => 'A ementa da lei orçamentária é obrigatória.',
        ];
    }
}
