<?php

namespace App\Http\Controllers\Loa;

use App\Http\Controllers\Controller;
use App\Models\Loa;
use App\Models\PrevisaoReceitaLoa;
use App\Models\DotacaoDespesaLoa;
use App\Models\AnexoCompatibilidadeLoa;
use App\Models\ReservaContingenciaLoa;
use App\Models\Funcao;
use App\Models\Programa;
use App\Models\Acao;
use App\Http\Requests\Loa\StoreLoaRequest;
use App\Http\Requests\Loa\UpdateLoaRequest;
use App\Http\Requests\Loa\StorePrevisaoReceitaRequest;
use App\Http\Requests\Loa\StoreDotacaoRequest;
use App\Http\Requests\Loa\StoreCompatibilidadeRequest;
use App\Http\Requests\Loa\StoreReservaContingenciaRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

/**
 * LoaController
 * Gestão da Lei Orçamentária Anual conforme Art. 165 §5º CF/88,
 * Art. 5º ao 9º da LRF e leiautes e-Sfinge TCE-MS v2.0 2026.
 */
class LoaController extends Controller
{
    public function index(Request $request)
    {
        $query = Loa::withCount(['previsaoReceitas', 'dotacoesDespesas', 'compatibilidade', 'reservaContingencia'])
            ->orderBy('ano', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $loas = $query->paginate(10)->withQueryString();

        // Calcular totais globais para cards
        $stats = [
            'total' => Loa::count(),
            'aprovadas' => Loa::where('status', 'aprovado')->count(),
            'total_receitas' => PrevisaoReceitaLoa::sum('valor_previsto'),
            'total_despesas' => DotacaoDespesaLoa::sum('valor_dotado'),
        ];

        return Inertia::render('LOA/LoaIndex', [
            'loas' => $loas,
            'stats' => $stats,
            'filters' => $request->only(['status']),
        ]);
    }

    public function create()
    {
        $funcoes = Funcao::orderBy('codigo')->get();
        $programas = Programa::select('codigo', 'nome')->orderBy('codigo')->get();
        $acoes = Acao::select('codigo', 'nome', 'programa_id')->orderBy('codigo')->get();
        $fontesRecursos = DotacaoDespesaLoa::FONTES_RECURSOS;
        $naturezasDespesa = DotacaoDespesaLoa::NATUREZAS_DESPESA;

        return Inertia::render('LOA/LoaForm', [
            'funcoes' => $funcoes,
            'programas' => $programas,
            'acoes' => $acoes,
            'fontesRecursos' => $fontesRecursos,
            'naturezasDespesa' => $naturezasDespesa,
        ]);
    }

    public function store(StoreLoaRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('pdf_lei')) {
            $data['pdf_lei'] = $request->file('pdf_lei')->store('loa_pdfs', 'public');
        }

        $loa = Loa::create($data);

        return redirect()->route('loa.edit', $loa->id)
            ->with('success', 'LOA criada com sucesso. Preencha agora receitas, despesas e anexos.');
    }

    public function show(Loa $loa)
    {
        $loa->load(['previsaoReceitas', 'dotacoesDespesas', 'compatibilidade', 'reservaContingencia']);

        $fontesRecursos = DotacaoDespesaLoa::FONTES_RECURSOS;
        $naturezasDespesa = DotacaoDespesaLoa::NATUREZAS_DESPESA;

        // Totais calculados
        $totais = [
            'receitas' => $loa->previsaoReceitas->sum('valor_previsto'),
            'despesas' => $loa->dotacoesDespesas->sum('valor_dotado'),
            'reserva' => $loa->reservaContingencia->sum('valor_reserva'),
        ];

        // Despesas agrupadas por função para gráfico pizza
        $despesasPorFuncao = $loa->dotacoesDespesas
            ->groupBy('funcao_codigo')
            ->map(fn($items, $codigo) => [
                'funcao' => $codigo,
                'total' => $items->sum('valor_dotado'),
            ])->values();

        return Inertia::render('LOA/LoaShow', [
            'loa' => $loa,
            'totais' => $totais,
            'despesasPorFuncao' => $despesasPorFuncao,
            'fontesRecursos' => $fontesRecursos,
            'naturezasDespesa' => $naturezasDespesa,
        ]);
    }

    public function edit(Loa $loa)
    {
        $loa->load(['previsaoReceitas', 'dotacoesDespesas', 'compatibilidade', 'reservaContingencia']);

        $funcoes = Funcao::orderBy('codigo')->get();
        $programas = Programa::select('codigo', 'nome')->orderBy('codigo')->get();
        $acoes = Acao::select('codigo', 'nome', 'programa_id')->orderBy('codigo')->get();
        $fontesRecursos = DotacaoDespesaLoa::FONTES_RECURSOS;
        $naturezasDespesa = DotacaoDespesaLoa::NATUREZAS_DESPESA;

        return Inertia::render('LOA/LoaForm', [
            'loa' => $loa,
            'funcoes' => $funcoes,
            'programas' => $programas,
            'acoes' => $acoes,
            'fontesRecursos' => $fontesRecursos,
            'naturezasDespesa' => $naturezasDespesa,
        ]);
    }

    public function update(UpdateLoaRequest $request, Loa $loa)
    {
        $data = $request->validated();

        if ($request->hasFile('pdf_lei')) {
            if ($loa->pdf_lei) Storage::disk('public')->delete($loa->pdf_lei);
            $data['pdf_lei'] = $request->file('pdf_lei')->store('loa_pdfs', 'public');
        }

        $loa->update($data);

        return redirect()->route('loa.edit', $loa->id)
            ->with('success', 'LOA atualizada com sucesso.');
    }

    public function destroy(Loa $loa)
    {
        if ($loa->pdf_lei) Storage::disk('public')->delete($loa->pdf_lei);
        $loa->delete();

        return redirect()->route('loa.index')
            ->with('success', 'LOA excluída com sucesso.');
    }

    // =====================================================================
    // ENDPOINTS PARA ANEXOS (salvamento em lote)
    // =====================================================================

    /** Salvar Previsão de Receitas (Art. 12 LRF) */
    public function salvarReceitas(StorePrevisaoReceitaRequest $request)
    {
        $validated = $request->validated();
        PrevisaoReceitaLoa::where('loa_id', $validated['loa_id'])->delete();
        foreach ($validated['receitas'] as $r) {
            PrevisaoReceitaLoa::create(array_merge($r, ['loa_id' => $validated['loa_id']]));
        }
        return redirect()->back()->with('success', 'Previsão de Receitas salva com sucesso.');
    }

    /** Salvar Dotações de Despesa (Lei 4.320/64 / e-Sfinge) */
    public function salvarDotacoes(StoreDotacaoRequest $request)
    {
        $validated = $request->validated();
        DotacaoDespesaLoa::where('loa_id', $validated['loa_id'])->delete();
        foreach ($validated['dotacoes'] as $d) {
            DotacaoDespesaLoa::create(array_merge($d, ['loa_id' => $validated['loa_id']]));
        }
        return redirect()->back()->with('success', 'Dotações de Despesa salvas com sucesso.');
    }

    /** Salvar Compatibilidade PPA/LDO (Art. 5º, I LRF) */
    public function salvarCompatibilidade(StoreCompatibilidadeRequest $request)
    {
        $validated = $request->validated();
        AnexoCompatibilidadeLoa::where('loa_id', $validated['loa_id'])->delete();
        foreach ($validated['itens'] as $item) {
            AnexoCompatibilidadeLoa::create(array_merge($item, ['loa_id' => $validated['loa_id']]));
        }
        return redirect()->back()->with('success', 'Compatibilidade salva com sucesso.');
    }

    /** Salvar Reserva de Contingência (Art. 5º, III LRF) */
    public function salvarReserva(StoreReservaContingenciaRequest $request)
    {
        $validated = $request->validated();
        ReservaContingenciaLoa::where('loa_id', $validated['loa_id'])->delete();
        foreach ($validated['reservas'] as $r) {
            ReservaContingenciaLoa::create(array_merge($r, ['loa_id' => $validated['loa_id']]));
        }
        return redirect()->back()->with('success', 'Reserva de Contingência salva com sucesso.');
    }

    /** Exportar JSON e-Sfinge TCE-MS */
    public function exportarEsfinge(Loa $loa)
    {
        $loa->load(['previsaoReceitas', 'dotacoesDespesas', 'compatibilidade', 'reservaContingencia']);

        $payload = [
            'loa' => [
                'ano' => $loa->ano,
                'numero' => $loa->numero_texto_juridico,
                'ementa' => $loa->ementa,
                'status' => $loa->status,
                'reserva_contingencia_pct' => $loa->reserva_contingencia_percentual,
            ],
            'receitas' => $loa->previsaoReceitas->map(fn($r) => [
                'codigo' => $r->codigo_receita,
                'descricao' => $r->descricao,
                'previsto' => $r->valor_previsto,
                'constante' => $r->valor_constante,
                'realizado_anterior' => $r->valor_realizado_ano_anterior,
            ]),
            'despesas' => $loa->dotacoesDespesas->map(fn($d) => [
                'funcao' => $d->funcao_codigo,
                'subfuncao' => $d->subfuncao_codigo,
                'programa' => $d->programa_codigo,
                'acao' => $d->acao_codigo,
                'unidade_orcamentaria' => $d->unidade_orcamentaria,
                'natureza' => $d->natureza_despesa,
                'fonte' => $d->fonte_recursos,
                'dotado' => $d->valor_dotado,
                'projeto_atividade' => $d->projeto_atividade,
            ]),
            'compatibilidade' => $loa->compatibilidade->map(fn($c) => [
                'demonstrativo' => $c->demonstrativo,
                'objetivo_ppa' => $c->objetivo_ppa,
                'meta_ldo' => $c->meta_ldo,
                'valor' => $c->valor_compatibilizado,
            ]),
            'reserva_contingencia' => $loa->reservaContingencia->map(fn($r) => [
                'descricao' => $r->descricao,
                'valor' => $r->valor_reserva,
            ]),
        ];

        return response()->json($payload, 200, [
            'Content-Disposition' => "attachment; filename=loa_{$loa->ano}_esfinge.json",
        ]);
    }
}
