<?php

namespace App\Http\Controllers\Ldo;

use App\Http\Controllers\Controller;
use App\Models\Ldo;
use App\Services\LdoMetasPrioridadesScraperService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LdoMetasPrioridadesScraperController extends Controller
{
    public function __construct(
        protected LdoMetasPrioridadesScraperService $scraperService
    ) {}

    public function importFromPortal(Request $request): JsonResponse
    {
        $request->validate([
            'portal_url' => 'required|url',
            'ano' => 'required|digits:4|integer|between:2000,2100',
            'ldo_id' => 'nullable|exists:ldos,id',
        ]);

        Log::info('[LdoMetasPrioridadesScraperController] Iniciando scraping', [
            'url' => $request->portal_url,
            'ano' => $request->ano,
            'ldo_id' => $request->ldo_id,
            'user_id' => $request->user()->id ?? null,
        ]);

        try {
            $metas = $this->scraperService->scrape($request->portal_url, $request->ano);

            $response = [
                'success' => true,
                'metas' => $metas,
                'count' => count($metas),
                'ano_importado' => $request->ano,
            ];

            if ($request->ldo_id) {
                $ldo = Ldo::find($request->ldo_id);
                if ($ldo) {
                    $response['ldo_selecionado'] = [
                        'id' => $ldo->id,
                        'ano' => $ldo->ano,
                    ];
                }
            }

            return response()->json($response);

        } catch (\Exception $e) {
            Log::error('[LdoMetasPrioridadesScraperController] Erro', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    public function importFromPortalConfirm(Request $request): JsonResponse
    {
        $request->validate([
            'metas' => 'required|array',
            'ano' => 'required|digits:4',
            'ldo_id' => 'nullable|exists:ldos,id',
        ]);

        $ldoId = $request->ldo_id;

        if (! $ldoId && $request->ano) {
            $ldo = $this->scraperService->findLdoByAno($request->ano);
            $ldoId = $ldo?->id;
        }

        Log::info('[LdoMetasPrioridadesScraperController] Confirmando importação', [
            'metas_count' => count($request->input('metas', [])),
            'ano' => $request->ano,
            'ldo_id' => $ldoId,
        ]);

        if (! $ldoId) {
            return response()->json([
                'success' => false,
                'error' => 'LDO não encontrada. Criada primeiro a LDO para o ano '.$request->ano,
            ], 422);
        }

        $result = $this->scraperService->importToDatabase(
            $request->input('metas', []),
            $ldoId
        );

        if ($result['sucesso'] === 0 && count($result['erros']) > 0) {
            return response()->json([
                'success' => false,
                'message' => "Erro na importação: {$result['sucesso']} novo(s), {$result['ignorados']} ignorado(s), ".count($result['erros']).' erro(s).',
                'sucesso' => $result['sucesso'],
                'ignorados' => $result['ignorados'],
                'erros' => $result['erros'],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => "Importação concluída: {$result['sucesso']} novo(s), {$result['ignorados']} ignorado(s), ".count($result['erros']).' erro(s).',
            'sucesso' => $result['sucesso'],
            'ignorados' => $result['ignorados'],
            'erros' => $result['erros'],
            'ldo_id' => $ldoId,
        ]);
    }
}
