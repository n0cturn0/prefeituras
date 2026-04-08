<?php

namespace App\Http\Controllers\Ldo;

use App\Http\Controllers\Controller;
use App\Models\Ldo;
use App\Models\AnexoMetasFiscais;
use App\Models\AnexoRiscosFiscais;
use App\Models\AudienciaPublicaLdo;
use App\Models\MetaPrioridadeLdo;
use App\Models\Acao;
use App\Http\Requests\Ldo\StoreLdoRequest;
use App\Http\Requests\Ldo\UpdateLdoRequest;
use App\Http\Requests\Ldo\StoreAnexoMetasFiscaisRequest;
use App\Http\Requests\Ldo\StoreAnexoRiscosFiscaisRequest;
use App\Http\Requests\Ldo\StoreAudienciaPublicaRequest;
use App\Http\Requests\Ldo\StoreMetasPrioridadesRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

/**
 * LdoController
 * Gestão completa da Lei de Diretrizes Orçamentárias
 * conforme Art. 4º da LC 101/2000 (LRF) e Resolução TCE-MS 88/2018.
 */
class LdoController extends Controller
{
    /**
     * Listagem das LDOs com filtros e estatísticas.
     */
    public function index(Request $request)
    {
        $query = Ldo::withCount(['metasFiscais', 'riscosFiscais', 'audienciasPublicas', 'metasPrioridades'])
            ->orderBy('ano', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $ldos = $query->paginate(10)->withQueryString();

        // Estatísticas rápidas para os cards
        $stats = [
            'total' => Ldo::count(),
            'aprovadas' => Ldo::where('status', 'aprovado')->count(),
            'em_elaboracao' => Ldo::where('status', 'em_elaboracao')->count(),
            'audiencias_total' => AudienciaPublicaLdo::count(),
        ];

        return Inertia::render('LDO/LdoIndex', [
            'ldos' => $ldos,
            'stats' => $stats,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Formulário de criação de nova LDO.
     */
    public function create()
    {
        // Carregar ações do PPA para vínculo das metas-prioridades
        $acoes = Acao::select('codigo', 'nome')->orderBy('codigo')->get();
        $tiposMeta = AnexoMetasFiscais::TIPOS_META;
        $meiosComunicacao = AudienciaPublicaLdo::MEIOS_COMUNICACAO;

        return Inertia::render('LDO/LdoForm', [
            'acoes' => $acoes,
            'tiposMeta' => $tiposMeta,
            'meiosComunicacao' => $meiosComunicacao,
        ]);
    }

    /**
     * Persistir nova LDO.
     */
    public function store(StoreLdoRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('pdf_lei')) {
            $data['pdf_lei'] = $request->file('pdf_lei')->store('ldo_pdfs', 'public');
        }

        $ldo = Ldo::create($data);

        return redirect()->route('ldo.edit', $ldo->id)
            ->with('success', 'LDO criada com sucesso. Preencha agora os anexos obrigatórios.');
    }

    /**
     * Visualização completa da LDO com todos os anexos.
     */
    public function show(Ldo $ldo)
    {
        $ldo->load(['metasFiscais', 'riscosFiscais', 'audienciasPublicas', 'metasPrioridades']);

        $tiposMeta = AnexoMetasFiscais::TIPOS_META;
        $meiosComunicacao = AudienciaPublicaLdo::MEIOS_COMUNICACAO;

        return Inertia::render('LDO/LdoShow', [
            'ldo' => $ldo,
            'tiposMeta' => $tiposMeta,
            'meiosComunicacao' => $meiosComunicacao,
        ]);
    }

    /**
     * Formulário de edição da LDO + anexos.
     */
    public function edit(Ldo $ldo)
    {
        $ldo->load(['metasFiscais', 'riscosFiscais', 'audienciasPublicas', 'metasPrioridades']);

        $acoes = Acao::select('codigo', 'nome')->orderBy('codigo')->get();
        $tiposMeta = AnexoMetasFiscais::TIPOS_META;
        $meiosComunicacao = AudienciaPublicaLdo::MEIOS_COMUNICACAO;

        return Inertia::render('LDO/LdoForm', [
            'ldo' => $ldo,
            'acoes' => $acoes,
            'tiposMeta' => $tiposMeta,
            'meiosComunicacao' => $meiosComunicacao,
        ]);
    }

    /**
     * Atualizar dados-base da LDO.
     */
    public function update(UpdateLdoRequest $request, Ldo $ldo)
    {
        $data = $request->validated();

        if ($request->hasFile('pdf_lei')) {
            if ($ldo->pdf_lei) {
                Storage::disk('public')->delete($ldo->pdf_lei);
            }
            $data['pdf_lei'] = $request->file('pdf_lei')->store('ldo_pdfs', 'public');
        }

        $ldo->update($data);

        return redirect()->route('ldo.edit', $ldo->id)
            ->with('success', 'LDO atualizada com sucesso.');
    }

    /**
     * Excluir LDO (soft delete).
     */
    public function destroy(Ldo $ldo)
    {
        if ($ldo->pdf_lei) {
            Storage::disk('public')->delete($ldo->pdf_lei);
        }
        $ldo->delete();

        return redirect()->route('ldo.index')
            ->with('success', 'LDO excluída com sucesso.');
    }

    // =====================================================================
    // ENDPOINTS PARA ANEXOS (salvamento em lote via AJAX)
    // =====================================================================

    /**
     * Salvar/substituir Metas Fiscais (Art. 4º, §1º LRF)
     */
    public function salvarMetasFiscais(StoreAnexoMetasFiscaisRequest $request)
    {
        $validated = $request->validated();

        // Substituir todas as metas existentes desta LDO
        AnexoMetasFiscais::where('ldo_id', $validated['ldo_id'])->delete();

        foreach ($validated['metas'] as $meta) {
            AnexoMetasFiscais::create(array_merge($meta, ['ldo_id' => $validated['ldo_id']]));
        }

        return redirect()->back()->with('success', 'Metas Fiscais salvas com sucesso.');
    }

    /**
     * Salvar/substituir Riscos Fiscais (Art. 4º, §3º LRF)
     */
    public function salvarRiscosFiscais(StoreAnexoRiscosFiscaisRequest $request)
    {
        $validated = $request->validated();

        AnexoRiscosFiscais::where('ldo_id', $validated['ldo_id'])->delete();

        foreach ($validated['riscos'] as $risco) {
            AnexoRiscosFiscais::create(array_merge($risco, ['ldo_id' => $validated['ldo_id']]));
        }

        return redirect()->back()->with('success', 'Riscos Fiscais salvos com sucesso.');
    }

    /**
     * Salvar/substituir Audiências Públicas (Art. 48 LRF / TCE-MS)
     */
    public function salvarAudiencias(StoreAudienciaPublicaRequest $request)
    {
        $validated = $request->validated();

        AudienciaPublicaLdo::where('ldo_id', $validated['ldo_id'])->delete();

        foreach ($validated['audiencias'] as $audiencia) {
            AudienciaPublicaLdo::create(array_merge($audiencia, ['ldo_id' => $validated['ldo_id']]));
        }

        return redirect()->back()->with('success', 'Audiências Públicas salvas com sucesso.');
    }

    /**
     * Salvar/substituir Metas e Prioridades (Art. 165 §2º CF)
     */
    public function salvarMetasPrioridades(StoreMetasPrioridadesRequest $request)
    {
        $validated = $request->validated();

        MetaPrioridadeLdo::where('ldo_id', $validated['ldo_id'])->delete();

        foreach ($validated['metas'] as $meta) {
            MetaPrioridadeLdo::create(array_merge($meta, ['ldo_id' => $validated['ldo_id']]));
        }

        return redirect()->back()->with('success', 'Metas e Prioridades salvas com sucesso.');
    }

    /**
     * Exportar dados da LDO em formato JSON compatível e-Sfinge.
     */
    public function exportarEsfinge(Ldo $ldo)
    {
        $ldo->load(['metasFiscais', 'riscosFiscais', 'audienciasPublicas', 'metasPrioridades']);

        $payload = [
            'ldo' => [
                'ano' => $ldo->ano,
                'ementa' => $ldo->ementa,
                'status' => $ldo->status,
            ],
            'metas_fiscais' => $ldo->metasFiscais->map(fn($m) => [
                'tipo' => $m->tipo_meta,
                'ano' => $m->ano_meta,
                'previsto' => $m->valor_previsto,
                'constante' => $m->valor_constante,
                'realizado_anterior' => $m->valor_realizado_ano_anterior,
            ]),
            'riscos_fiscais' => $ldo->riscosFiscais->map(fn($r) => [
                'descricao' => $r->descricao,
                'valor' => $r->valor_estimado,
                'providencia' => $r->providencia,
            ]),
            'audiencias' => $ldo->audienciasPublicas->map(fn($a) => [
                'convocacao' => $a->data_primeira_convocacao,
                'data' => $a->data_audiencia,
                'local' => $a->local,
                'meio' => $a->tipo_meio_comunicacao,
                'veiculo' => $a->nome_veiculo,
            ]),
            'metas_prioridades' => $ldo->metasPrioridades->map(fn($mp) => [
                'acao' => $mp->acao_codigo,
                'descricao' => $mp->descricao,
                'meta_fisica' => $mp->meta_fisica_prevista,
                'unidade' => $mp->unidade_medida,
                'valor' => $mp->valor_financeiro_previsto,
            ]),
        ];

        return response()->json($payload, 200, [
            'Content-Disposition' => "attachment; filename=ldo_{$ldo->ano}_esfinge.json",
        ]);
    }
}
