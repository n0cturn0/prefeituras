<?php

namespace App\Http\Controllers\Ppa;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ppa\ImportPpaFromUrlRequest;
use App\Models\Indicador;
use App\Models\Ppa;
use App\Models\Programa;
use App\Services\PpaScraperService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Controller para importação de PPA externo via scraping.
 *
 * Endpoints:
 * - POST /transparencia/ppa/import-from-url - Analisa e importa dados de URL externa
 * - POST /transparencia/ppa/import-confirm - Confirma e persiste os dados importados
 */
class PpaScraperController extends Controller
{
    public function __construct(
        protected PpaScraperService $scraperService
    ) {}

    /**
     * Analisa uma URL externa e retorna preview dos dados.
     *
     * Este endpoint:
     * 1. Valida a URL
     * 2. Executa o scraping
     * 3. Retorna dados formatados para preview no frontend
     * 4. NÃO persiste nada no banco (apenas retorna para preview)
     */
    public function importFromUrl(ImportPpaFromUrlRequest $request): JsonResponse
    {
        // Verificar autenticação explicitamente - retorna JSON se não autenticado
        if (! $request->user()) {
            return response()->json([
                'success' => false,
                'error' => 'Unauthorized. Faça login novamente.',
            ], 401);
        }

        $dryRun = $request->boolean('dry_run', true);

        $result = $this->scraperService->scrape($request->url, $dryRun);

        if (! $result['success']) {
            return response()->json([
                'success' => false,
                'error' => $result['error'],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'preview' => $result['data'],
            'metadata' => $result['metadata'],
        ]);
    }

    /**
     * Confirma e persiste os dados importados.
     *
     * Este endpoint é chamado após o usuário revisar o preview
     * e clicar em "Confirmar e Salvar".
     *
     * Cria:
     * 1. PPA com os dados principais
     * 2. Programas relacionados ao PPA
     * 3. Ações relacionadas aos Programas
     * 4. Indicadores relacionados a Programas ou Ações
     */
    public function importConfirm(Request $request): JsonResponse
    {
        // Verificar autenticação explicitamente - retorna JSON se não autenticado
        if (! $request->user()) {
            return response()->json([
                'success' => false,
                'error' => 'Unauthorized. Faça login novamente.',
            ], 401);
        }

        $request->validate([
            'ppa' => 'required|array',
            'programas' => 'required|array',
        ]);

        try {
            DB::beginTransaction();

            // 1. Criar PPA
            $ppa = Ppa::create([
                'municipio_id' => $request->user()->municipio_id ?? null,
                'ano_inicio' => $request->input('ppa.ano_inicio'),
                'ano_fim' => $request->input('ppa.ano_fim'),
                'visao' => $request->input('ppa.visao', ''),
                'valores' => $request->input('ppa.valores', ''),
                'diretrizes' => $request->input('ppa.diretrizes', ''),
                'eixos_estrategicos' => $request->input('ppa.eixos_estrategicos', []),
                'status' => $request->input('ppa.status', 'em_vigor'),
            ]);

            $programasData = $request->input('programas', []);
            $acoesData = $request->input('acoes', []);
            $indicadoresData = $request->input('indicadores', []);

            // 2. Criar Programas
            $programaIdMap = [];
            foreach ($programasData as $index => $programaData) {
                $programa = $ppa->programas()->create([
                    'codigo' => $programaData['codigo'] ?? ($index + 1),
                    'nome' => $programaData['nome'],
                    'objetivo' => $programaData['objetivo'] ?? '',
                    'problema' => $programaData['problema'] ?? '',
                    'publico_alvo' => $programaData['publico_alvo'] ?? '',
                    'funcao_codigo' => $programaData['funcao_codigo'],
                    'subfuncao_codigo' => $programaData['subfuncao_codigo'],
                    'tipo_programa' => $programaData['tipo_programa'] ?? 'finalístico',
                    'responsavel' => $programaData['responsavel'] ?? '',
                    'unidade_gestora' => $programaData['unidade_gestora'] ?? '',
                    'valor_global' => $programaData['valor_global'],
                    'fonte_financiamento_fiscal' => $programaData['fonte_financiamento_fiscal'] ?? '',
                    'fonte_financiamento_seguridade' => $programaData['fonte_financiamento_seguridade'] ?? '',
                    'alinhamento_ods' => $programaData['alinhamento_ods'] ?? [],
                    'meta_fisica_total' => $programaData['meta_fisica_total'],
                    'meta_financeira_total' => $programaData['meta_financeira_total'],
                ]);

                $programaIdMap[$programaData['codigo'] ?? $index] = $programa->id;
            }

            // 3. Criar Ações (mapeando para o programa correto)
            foreach ($acoesData as $acaoData) {
                $programaId = $acaoData['programa_codigo']
                    ? ($programaIdMap[$acaoData['programa_codigo']] ?? null)
                    : ($acaoData['programa_id'] ?? null);

                if (! $programaId && count($programaIdMap) > 0) {
                    $programaId = array_values($programaIdMap)[0];
                }

                if ($programaId) {
                    $programa = Programa::find($programaId);
                    $programa->acoes()->create([
                        'codigo' => $acaoData['codigo'],
                        'nome' => $acaoData['nome'],
                        'descricao' => $acaoData['descricao'] ?? '',
                        'iniciativa' => $acaoData['iniciativa'] ?? '',
                        'objetivo_especifico' => $acaoData['objetivo_especifico'] ?? '',
                        'produto' => $acaoData['produto'] ?? '',
                        'unidade_medida' => $acaoData['unidade_medida'] ?? '',
                        'beneficiario' => $acaoData['beneficiario'] ?? '',
                        'meta_fisica_ano1' => $acaoData['meta_fisica_ano1'],
                        'meta_fisica_ano2' => $acaoData['meta_fisica_ano2'],
                        'meta_fisica_ano3' => $acaoData['meta_fisica_ano3'],
                        'meta_fisica_ano4' => $acaoData['meta_fisica_ano4'],
                        'valor_global_acao' => $acaoData['valor_global_acao'],
                        'funcao_codigo' => $acaoData['funcao_codigo'],
                        'subfuncao_codigo' => $acaoData['subfuncao_codigo'],
                    ]);
                }
            }

            // 4. Criar Indicadores (mapeando para programa ou ação)
            foreach ($indicadoresData as $indicadorData) {
                $programaId = $indicadorData['programa_codigo']
                    ? ($programaIdMap[$indicadorData['programa_codigo']] ?? null)
                    : ($indicadorData['programa_id'] ?? null);

                Indicador::create([
                    'programa_id' => $programaId,
                    'acao_id' => $indicadorData['acao_id'] ?? null,
                    'nome' => $indicadorData['nome'],
                    'formula' => $indicadorData['formula'] ?? '',
                    'unidade_medida' => $indicadorData['unidade_medida'] ?? '',
                    'meta_ano1' => $indicadorData['meta_ano1'],
                    'meta_ano2' => $indicadorData['meta_ano2'],
                    'meta_ano3' => $indicadorData['meta_ano3'],
                    'meta_ano4' => $indicadorData['meta_ano4'],
                    'peso' => $indicadorData['peso'] ?? 1,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'PPA importado com sucesso!',
                'ppa_id' => $ppa->id,
                'programas_count' => count($programasData),
                'acoes_count' => count($acoesData),
                'indicadores_count' => count($indicadoresData),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'error' => 'Erro ao salvar PPA: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Retorna logs de scraping para auditoria.
     */
    public function logs(Request $request): JsonResponse
    {
        // Verificar autenticação explicitamente - retorna JSON se não autenticado
        if (! $request->user()) {
            return response()->json([
                'success' => false,
                'error' => 'Unauthorized. Faça login novamente.',
            ], 401);
        }

        $logs = \App\Models\PpaScraperLog::orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json([
            'logs' => $logs,
        ]);
    }
}
