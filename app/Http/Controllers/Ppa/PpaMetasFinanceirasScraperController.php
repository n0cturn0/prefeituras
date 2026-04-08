<?php

namespace App\Http\Controllers\Ppa;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ppa\ImportMetasFinanceirasRequest;
use App\Models\Ppa;
use App\Services\PpaMetasFinanceirasScraperService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PpaMetasFinanceirasScraperController extends Controller
{
    public function __construct(
        protected PpaMetasFinanceirasScraperService $scraperService
    ) {}

    /**
     * Escaneia o portal e retorna lista de programas encontrados.
     */
    public function importFromPortal(ImportMetasFinanceirasRequest $request): JsonResponse
    {
        $ppa = $this->scraperService->findPpaByAno($request->ano);

        Log::info('[PpaMetasFinanceirasScraperController] Iniciando scraping', [
            'url' => $request->portal_url,
            'ano' => $request->ano,
            'ppa_encontrado' => $ppa ? "{$ppa->ano_inicio}-{$ppa->ano_fim}" : 'null',
        ]);

        try {
            $programas = $this->scraperService->scrape($request->portal_url, $request->ano);

            $response = [
                'success' => true,
                'programas' => $programas,
                'count' => count($programas),
                'ano_importado' => $request->ano,
            ];

            if ($ppa) {
                $response['ppa_selecionado'] = [
                    'id' => $ppa->id,
                    'ano_inicio' => $ppa->ano_inicio,
                    'ano_fim' => $ppa->ano_fim,
                ];
            }

            return response()->json($response);

        } catch (\Exception $e) {
            Log::error('[PpaMetasFinanceirasScraperController] Erro', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Confirma importação dos programas.
     */
    public function importFromPortalConfirm(Request $request): JsonResponse
    {
        $request->validate([
            'programas' => 'required|array',
            'ano' => 'required|digits:4',
            'ppa_id' => 'nullable|exists:ppas,id',
        ]);

        $ppaId = $request->ppa_id;

        if (! $ppaId && $request->ano) {
            $ppa = $this->scraperService->findPpaByAno($request->ano);
            $ppaId = $ppa?->id;
        }

        Log::info('[PpaMetasFinanceirasScraperController] Confirmando importação', [
            'programas_count' => count($request->input('programas', [])),
            'ano' => $request->ano,
            'ppa_id' => $ppaId,
        ]);

        $result = $this->scraperService->importToDatabase(
            $request->input('programas', []),
            $ppaId
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

        if ($result['sucesso'] === 0 && $result['ignorados'] > 0) {
            return response()->json([
                'success' => false,
                'message' => "Nenhum programa novo: {$result['ignorados']} já existente(s).",
                'sucesso' => $result['sucesso'],
                'ignorados' => $result['ignorados'],
                'erros' => $result['erros'],
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => "Importação concluída: {$result['sucesso']} novo(s), {$result['ignorados']} ignorado(s).",
            'sucesso' => $result['sucesso'],
            'ignorados' => $result['ignorados'],
            'erros' => $result['erros'],
        ]);
    }

    /**
     * Busca PPAs disponíveis para importação.
     */
    public function getPpas(Request $request): JsonResponse
    {
        $ppas = Ppa::select('id', 'ano_inicio', 'ano_fim', 'status')
            ->orderBy('ano_inicio', 'desc')
            ->get();

        return response()->json(['ppas' => $ppas]);
    }
}
