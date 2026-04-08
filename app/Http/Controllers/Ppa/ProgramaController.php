<?php

namespace App\Http\Controllers\Ppa;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ppa\StoreProgramaRequest;
use App\Http\Requests\Ppa\UpdateProgramaRequest;
use App\Models\Funcao;
use App\Models\Ppa;
use App\Models\Programa;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgramaController extends Controller
{
    public function index(Request $request)
    {
        $query = Programa::with(['ppa', 'acoes'])->orderBy('id', 'desc');

        if ($request->filled('ano')) {
            $query->whereHas('ppa', function ($q) use ($request) {
                $q->where('ano_inicio', '<=', $request->ano)
                    ->where('ano_fim', '>=', $request->ano);
            });
        }

        $programas = $query->paginate(15)->withQueryString();

        $ppasAll = Ppa::select('ano_inicio', 'ano_fim')->get();
        $anos = collect();
        foreach ($ppasAll as $ppa) {
            for ($ano = $ppa->ano_inicio; $ano <= $ppa->ano_fim; $ano++) {
                $anos->push($ano);
            }
        }
        $anos = $anos->unique()->sortDesc()->values()->toArray();

        return Inertia::render('PPA/ProgramaList', [
            'programas' => $programas,
            'filters' => $request->only(['ano', 'search', 'funcao_codigo']),
            'anos' => $anos,
            'funcoes' => Funcao::orderBy('codigo')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('PPA/ProgramaForm', [
            'ppas' => Ppa::select('id', 'ano_inicio', 'ano_fim', 'status')->get(),
            'funcoes' => Funcao::orderBy('codigo')->get(),
        ]);
    }

    public function store(StoreProgramaRequest $request)
    {
        Programa::create($request->validated());

        return redirect()->route('programas.index')->with('success', 'Programa criado com sucesso.');
    }

    public function show(Programa $programa)
    {
        $programa->load(['ppa', 'acoes', 'indicadores']);

        return Inertia::render('PPA/ProgramaShow', [
            'programa' => $programa,
        ]);
    }

    public function edit(Programa $programa)
    {
        return Inertia::render('PPA/ProgramaForm', [
            'programa' => $programa,
            'ppas' => Ppa::select('id', 'ano_inicio', 'ano_fim')->get(),
            'funcoes' => Funcao::orderBy('codigo')->get(),
        ]);
    }

    public function update(UpdateProgramaRequest $request, Programa $programa)
    {
        $programa->update($request->validated());

        return redirect()->route('programas.index')->with('success', 'Programa atualizado com sucesso.');
    }

    public function destroy(Programa $programa)
    {
        $programa->delete();

        return redirect()->route('programas.index')->with('success', 'Programa excluído com sucesso.');
    }
}
