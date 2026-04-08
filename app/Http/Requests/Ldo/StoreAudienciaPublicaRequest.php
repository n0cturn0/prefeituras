<?php

namespace App\Http\Requests\Ldo;

use Illuminate\Foundation\Http\FormRequest;

class StoreAudienciaPublicaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ldo_id' => ['required', 'exists:ldos,id'],
            'audiencias' => ['required', 'array', 'min:1'],
            'audiencias.*.data_primeira_convocacao' => ['required', 'date'],
            'audiencias.*.data_audiencia' => ['required', 'date', 'after_or_equal:audiencias.*.data_primeira_convocacao'],
            'audiencias.*.local' => ['required', 'string', 'max:150'],
            'audiencias.*.tipo_meio_comunicacao' => ['required', 'in:diario_oficial,jornal_impresso,radio,televisao,internet,mural_publico,outro'],
            'audiencias.*.nome_veiculo' => ['nullable', 'string', 'max:150'],
            'audiencias.*.observacoes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'audiencias.required' => 'É necessário registrar ao menos uma audiência pública (Art. 48 LRF / TCE-MS 88/2018).',
            'audiencias.*.data_audiencia.after_or_equal' => 'A data da audiência deve ser posterior à data da convocação.',
        ];
    }
}
