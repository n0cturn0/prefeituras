<?php

namespace App\Http\Requests\Ppa;

use Illuminate\Foundation\Http\FormRequest;

class UpdateIndicadorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'programa_id' => ['nullable', 'exists:programas,id'],
            'acao_id' => ['nullable', 'exists:acoes,id'],
            'nome' => ['required', 'string', 'max:255'],
            'formula' => ['required', 'string'],
            'unidade_medida' => ['required', 'string', 'max:50'],
            'meta_ano1' => ['nullable', 'numeric', 'min:0'],
            'meta_ano2' => ['nullable', 'numeric', 'min:0'],
            'meta_ano3' => ['nullable', 'numeric', 'min:0'],
            'meta_ano4' => ['nullable', 'numeric', 'min:0'],
            'peso' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
