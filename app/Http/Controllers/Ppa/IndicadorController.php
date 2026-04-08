<?php

namespace App\Http\Controllers\Ppa;

use App\Http\Controllers\Controller;
use App\Models\Indicador;
use App\Models\Programa;
use App\Models\Acao;
use App\Http\Requests\Ppa\StoreIndicadorRequest;
use App\Http\Requests\Ppa\UpdateIndicadorRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IndicadorController extends Controller
{
    public function create(Request $request)
    {
        return Inertia::render('PPA/IndicadorForm', [
            'programa_id' => $request->query('programa_id'),
            'acao_id' => $request->query('acao_id'),
            'programas' => Programa::select('id', 'nome')->get(),
            'acoes' => Acao::select('id', 'nome')->get()
        ]);
    }

    public function store(StoreIndicadorRequest $request)
    {
        $indicador = Indicador::create($request->validated());
        
        $redirectId = $indicador->programa_id;
        if($redirectId) {
            return redirect()->route('programas.show', $redirectId)->with('success', 'Indicador criado com sucesso.');
        }
        return redirect()->back()->with('success', 'Indicador criado com sucesso.');
    }

    public function edit(Indicador $indicador)
    {
        return Inertia::render('PPA/IndicadorForm', [
            'indicador' => $indicador,
            'programas' => Programa::select('id', 'nome')->get(),
            'acoes' => Acao::select('id', 'nome')->get()
        ]);
    }

    public function update(UpdateIndicadorRequest $request, Indicador $indicador)
    {
        $indicador->update($request->validated());
        
        $redirectId = $indicador->programa_id;
        if($redirectId) {
            return redirect()->route('programas.show', $redirectId)->with('success', 'Indicador atualizado com sucesso.');
        }
        return redirect()->back()->with('success', 'Indicador atualizado com sucesso.');
    }

    public function destroy(Indicador $indicador)
    {
        $indicador->delete();
        return redirect()->back()->with('success', 'Indicador excluído com sucesso.');
    }
}
