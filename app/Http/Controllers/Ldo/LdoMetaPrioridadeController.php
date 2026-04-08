<?php

namespace App\Http\Controllers\Ldo;

use App\Http\Controllers\Controller;
use App\Models\Ldo;
use App\Models\MetaPrioridadeLdo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LdoMetaPrioridadeController extends Controller
{
    public function index(Request $request)
    {
        $query = MetaPrioridadeLdo::with(['ldo'])->orderBy('id', 'desc');

        if ($request->filled('ano')) {
            $query->whereHas('ldo', function ($q) use ($request) {
                $q->where('ano', $request->ano);
            });
        }

        if ($request->filled('search')) {
            $query->where('descricao', 'like', '%'.$request->search.'%');
        }

        $metas = $query->paginate(15)->withQueryString();

        $ldosAll = Ldo::select('ano')->get();
        $anos = $ldosAll->pluck('ano')->unique()->sortDesc()->values()->toArray();

        return Inertia::render('LDO/MetaPrioridadeList', [
            'metas' => $metas,
            'filters' => $request->only(['ano', 'search']),
            'anos' => $anos,
        ]);
    }

    public function create()
    {
        $ldos = Ldo::select('id', 'ano', 'status')->orderBy('ano', 'desc')->get();

        return Inertia::render('LDO/MetaPrioridadeForm', [
            'ldos' => $ldos,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ldo_id' => 'required|exists:ldos,id',
            'acao_codigo' => 'nullable|string|max:10',
            'funcao_codigo' => 'nullable|string|max:2',
            'subfuncao_codigo' => 'nullable|string|max:3',
            'descricao' => 'required|string',
            'meta_fisica_prevista' => 'nullable|numeric',
            'unidade_medida' => 'nullable|string|max:50',
            'valor_financeiro_previsto' => 'required|numeric',
            'valor_empenhado' => 'nullable|numeric',
            'valor_liquidado' => 'nullable|numeric',
            'valor_pago' => 'nullable|numeric',
        ]);

        MetaPrioridadeLdo::create($validated);

        return redirect()->route('ldo-metas-prioridades.index')
            ->with('success', 'Meta/Prioridade criada com sucesso.');
    }

    public function show(MetaPrioridadeLdo $ldo_meta_prioridade)
    {
        $ldo_meta_prioridade->load(['ldo']);

        return Inertia::render('LDO/MetaPrioridadeShow', [
            'meta' => $ldo_meta_prioridade,
        ]);
    }

    public function edit(MetaPrioridadeLdo $ldo_meta_prioridade)
    {
        $ldos = Ldo::select('id', 'ano', 'status')->orderBy('ano', 'desc')->get();

        return Inertia::render('LDO/MetaPrioridadeForm', [
            'meta' => $ldo_meta_prioridade,
            'ldos' => $ldos,
        ]);
    }

    public function update(Request $request, MetaPrioridadeLdo $ldo_meta_prioridade)
    {
        $validated = $request->validate([
            'ldo_id' => 'required|exists:ldos,id',
            'acao_codigo' => 'nullable|string|max:10',
            'funcao_codigo' => 'nullable|string|max:2',
            'subfuncao_codigo' => 'nullable|string|max:3',
            'descricao' => 'required|string',
            'meta_fisica_prevista' => 'nullable|numeric',
            'unidade_medida' => 'nullable|string|max:50',
            'valor_financeiro_previsto' => 'required|numeric',
            'valor_empenhado' => 'nullable|numeric',
            'valor_liquidado' => 'nullable|numeric',
            'valor_pago' => 'nullable|numeric',
        ]);

        $ldo_meta_prioridade->update($validated);

        return redirect()->route('ldo-metas-prioridades.index')
            ->with('success', 'Meta/Prioridade atualizada com sucesso.');
    }

    public function destroy(MetaPrioridadeLdo $ldo_meta_prioridade)
    {
        $ldo_meta_prioridade->delete();

        return redirect()->route('ldo-metas-prioridades.index')
            ->with('success', 'Meta/Prioridade excluída com sucesso.');
    }
}
