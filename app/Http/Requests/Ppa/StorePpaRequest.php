<?php

namespace App\Http\Requests\Ppa;

use Illuminate\Foundation\Http\FormRequest;

class StorePpaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Handle via policy/middleware in controller
    }

    public function rules(): array
    {
        $maxFileSize = 5120; // 5MB - deve ser menor que upload_max_filesize do PHP

        return [
            'municipio_id' => ['nullable', 'integer'],
            'ano_inicio' => ['required', 'digits:4', 'integer'],
            'ano_fim' => ['required', 'digits:4', 'integer', 'gte:ano_inicio'],
            'visao' => ['required', 'string', 'max:2000'],
            'valores' => ['nullable', 'string', 'max:3000'],
            'diretrizes' => ['required', 'string', 'max:3000'],
            'eixos_estrategicos' => ['nullable', 'array'],
            'status' => ['required', 'in:em_vigor,revisao,arquivado'],
            'pdf_lei_ppa' => ['nullable', 'file', 'mimes:pdf', 'max:'.$maxFileSize],
            'data_aprovacao_lei' => ['nullable', 'date'],
        ];
    }
}
