<?php

namespace App\Http\Requests\Loa;

use Illuminate\Foundation\Http\FormRequest;

class StoreReservaContingenciaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'loa_id' => ['required', 'exists:loas,id'],
            'reservas' => ['required', 'array', 'min:1'],
            'reservas.*.descricao' => ['required', 'string'],
            'reservas.*.valor_reserva' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'reservas.required' => 'É necessário informar a reserva de contingência (Art. 5º, III LRF).',
        ];
    }
}
