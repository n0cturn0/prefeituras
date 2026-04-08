<?php

namespace App\Http\Requests\Ppa;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProgramaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $programa = $this->route('programa');
        return [
            'codigo' => [
                'required', 'string', 'max:10',
                Rule::unique('programas')->ignore($programa)->where(fn ($query) => $query->where('ppa_id', $this->ppa_id ?? $programa->ppa_id))
            ],
            'nome' => ['required', 'string', 'max:255'],
            'ppa_id' => ['required', 'exists:ppas,id'],
            'objetivo' => ['required', 'string'],
            'problema' => ['nullable', 'string'],
            'publico_alvo' => ['nullable', 'string', 'max:255'],
            'funcao_codigo' => ['required', 'exists:funcoes,codigo'],
            'subfuncao_codigo' => ['required', 'exists:subfuncoes,codigo'],
            'tipo_programa' => ['required', 'in:finalistico,gestao_manutencao,operacoes_especiais'],
            'responsavel' => ['required', 'string', 'max:150'],
            'unidade_gestora' => ['nullable', 'string', 'max:100'],
            'valor_global' => ['required', 'numeric', 'min:0'],
            'fonte_financiamento_fiscal' => ['required', 'in:S,N'],
            'fonte_financiamento_seguridade' => ['required', 'in:S,N'],
            'alinhamento_ods' => ['nullable', 'array'],
            'meta_fisica_total' => ['nullable', 'numeric', 'min:0'],
            'meta_financeira_total' => ['required', 'numeric', 'min:0'],
            'data_inicio' => ['required', 'date'],
            'data_fim' => ['required', 'date', 'after_or_equal:data_inicio'],
        ];
    }
}
