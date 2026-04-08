<?php

namespace App\Http\Controllers\Ppa;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ppa\ImportPpaFromPortalRequest;
use App\Services\PpaPortalScraperService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Controller para importação de PPA via Portal QualitySistemas.
 *
 * Endpoints:
 * - POST /transparencia/ppa/import-from-portal - Escaneia e lista documentos
 * - POST /transparencia/ppa/import-from-portal-confirm - Confirma importação
 */
class PpaPortalScraperController extends Controller
{
    public function __construct(
        protected PpaPortalScraperService $scraperService
    ) {}

    /**
     * Escaneia o portal e retorna lista de documentos encontrados.
     *
     * Não faz upload, apenas lista para o usuário revisar.
     */
    public function importFromPortal(ImportPpaFromPortalRequest $request): JsonResponse
    {
        Log::info('[PpaPortalScraperController] Iniciando scraping', [
            'url' => $request->portal_url,
            'user_id' => $request->user()->id ?? null,
            'user_email' => $request->user()->email ?? null,
        ]);

        try {
            $documentos = $this->scraperService->scrape($request->portal_url);

            Log::info('[PpaPortalScraperController] Scraping concluído', [
                'documentos_count' => count($documentos),
            ]);

            return response()->json([
                'success' => true,
                'documentos' => $documentos,
                'count' => count($documentos),
            ]);

        } catch (\Exception $e) {
            Log::error('[PpaPortalScraperController] Erro no scraping', [
                'message' => $e->getMessage(),
                'url' => $request->portal_url,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Confirma e importa os documentos selecionados.
     *
     * Para cada documento:
     * 1. Verifica duplicatas (ignora se existir)
     * 2. Download do PDF
     * 3. Upload para sistema local
     */
    public function importFromPortalConfirm(Request $request): JsonResponse
    {
        $request->validate([
            'documentos' => 'required|array',
        ]);

        Log::info('[PpaPortalScraperController] Confirmando importação', [
            'documentos_count' => count($request->input('documentos', [])),
            'user_id' => $request->user()->id ?? null,
        ]);

        $documentos = $request->input('documentos', []);

        $sucesso = 0;
        $ignorados = 0;
        $erros = 0;

        foreach ($documentos as $documento) {
            try {
                $result = $this->scraperService->uploadToLocal($documento);

                if ($result === true) {
                    $sucesso++;
                } else {
                    $ignorados++; // Duplicate ou erro não crítico
                }
            } catch (\Exception $e) {
                $erros++;
                Log::error('[PpaPortalScraperController] Erro ao importar documento', [
                    'documento' => $documento,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('[PpaPortalScraperController] Importação concluída', [
            'sucesso' => $sucesso,
            'ignorados' => $ignorados,
            'erros' => $erros,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Importação concluída: {$sucesso} novo(s), {$ignorados} ignorado(s) (duplicados), {$erros} erro(s).",
            'sucesso' => $sucesso,
            'ignorados' => $ignorados,
            'erros' => $erros,
        ]);
    }
}
