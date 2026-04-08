<?php

namespace App\Http\Controllers\Ppa;

use App\Http\Controllers\Controller;
use App\Models\Acao;
use App\Models\Programa;
use App\Models\Funcao;
use App\Http\Requests\Ppa\StoreAcaoRequest;
use App\Http\Requests\Ppa\UpdateAcaoRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AcaoController extends Controller
{
    public function create(Request $request)
    {
        $programa_id = $request->query('programa_id');
        return Inertia::render('PPA/AcaoForm', [
            'programa_id' => $programa_id,
            'programas' => Programa::select('id', 'codigo', 'nome')->get(),
            'funcoes' => Funcao::orderBy('codigo')->get()
        ]);
    }

    public function store(StoreAcaoRequest $request)
    {
        $acao = Acao::create($request->validated());
        return redirect()->route('programas.show', $acao->programa_id)->with('success', 'Ação criada com sucesso.');
    }

    public function edit(Acao $acao)
    {
        return Inertia::render('PPA/AcaoForm', [
            'acao' => $acao,
            'programas' => Programa::select('id', 'codigo', 'nome')->get(),
            'funcoes' => Funcao::orderBy('codigo')->get()
        ]);
    }

    public function update(UpdateAcaoRequest $request, Acao $acao)
    {
        $acao->update($request->validated());
        return redirect()->route('programas.show', $acao->programa_id)->with('success', 'Ação atualizada com sucesso.');
    }

    public function destroy(Acao $acao)
    {
        $programaId = $acao->programa_id;
        $acao->delete();
        return redirect()->route('programas.show', $programaId)->with('success', 'Ação excluída com sucesso.');
    }
}
