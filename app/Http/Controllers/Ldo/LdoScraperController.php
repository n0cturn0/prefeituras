<?php

namespace App\Http\Controllers\Ldo;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ldo\ImportLdoFromPortalRequest;
use App\Services\LdoPortalScraperService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LdoScraperController extends Controller
{
    public function __construct(
        protected LdoPortalScraperService $scraperService
    ) {}

    public function importFromPortal(ImportLdoFromPortalRequest $request): JsonResponse
    {
        Log::info('[LdoScraperController] Iniciando scraping', [
            'url' => $request->portal_url,
            'ano' => $request->ano,
            'user_id' => $request->user()->id ?? null,
            'user_email' => $request->user()->email ?? null,
        ]);

        try {
            $documentos = $this->scraperService->scrape($request->portal_url, $request->ano);

            Log::info('[LdoScraperController] Scraping concluído', [
                'documentos_count' => count($documentos),
                'ano_filtro' => $request->ano,
            ]);

            return response()->json([
                'success' => true,
                'documentos' => $documentos,
                'count' => count($documentos),
            ]);

        } catch (\Exception $e) {
            Log::error('[LdoScraperController] Erro no scraping', [
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

    public function importFromPortalConfirm(Request $request): JsonResponse
    {
        $request->validate([
            'documentos' => 'required|array',
        ]);

        Log::info('[LdoScraperController] Confirmando importação', [
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
                    $ignorados++;
                }
            } catch (\Exception $e) {
                $erros++;
                Log::error('[LdoScraperController] Erro ao importar documento', [
                    'documento' => $documento,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('[LdoScraperController] Importação concluída', [
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

    public function logs(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Logs de scraping de LDO - funcionalidade em desenvolvimento',
        ]);
    }
}
