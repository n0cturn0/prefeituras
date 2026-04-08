<?php

namespace App\Http\Requests\Ppa;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAcaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // handled by controller policy
    }

    public function rules(): array
    {
        $acao = $this->route('acao');
        return [
            'codigo' => [
                'required', 'string', 'max:10',
                Rule::unique('acoes')->ignore($acao)->where(fn ($query) => $query->where('programa_id', $this->programa_id ?? $acao->programa_id))
            ],
            'programa_id' => ['required', 'exists:programas,id'],
            'nome' => ['required', 'string', 'max:255'],
            'descricao' => ['required', 'string'],
            'iniciativa' => ['nullable', 'string', 'max:255'],
            'objetivo_especifico' => ['nullable', 'string'],
            'produto' => ['nullable', 'string', 'max:255'],
            'unidade_medida' => ['required', 'string', 'max:50'],
            'beneficiario' => ['nullable', 'string', 'max:255'],
            'meta_fisica_ano1' => ['nullable', 'numeric', 'min:0'],
            'meta_fisica_ano2' => ['nullable', 'numeric', 'min:0'],
            'meta_fisica_ano3' => ['nullable', 'numeric', 'min:0'],
            'meta_fisica_ano4' => ['nullable', 'numeric', 'min:0'],
            'valor_global_acao' => ['required', 'numeric', 'min:0'],
            'funcao_codigo' => ['required', 'exists:funcoes,codigo'],
            'subfuncao_codigo' => ['required', 'exists:subfuncoes,codigo'],
        ];
    }
}
