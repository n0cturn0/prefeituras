<?php

namespace App\Services;

use App\Models\Ldo;
use App\Models\MetaPrioridadeLdo;
use Illuminate\Support\Facades\Log;

class LdoMetasPrioridadesScraperService
{
    protected string $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    public function scrape(string $portalUrl, int $anoReferencia): array
    {
        Log::info('[LdoMetasPrioridadesScraperService] Iniciando scrape com Playwright', [
            'url' => $portalUrl,
            'ano' => $anoReferencia,
        ]);

        try {
            $scriptPath = base_path('scripts/python/scraper_ldo_metas.py');
            $venvPython = base_path('venv/bin/python');

            $command = $venvPython.' '.escapeshellarg($scriptPath).' '.escapeshellarg($portalUrl).' '.escapeshellarg($anoReferencia).' 2>&1';

            Log::info('[LdoMetasPrioridadesScraperService] Executando comando', ['command' => $command]);

            $output = [];
            $returnCode = 0;
            exec($command, $output, $returnCode);

            // Since Python script now only outputs JSON at the end, find the last line
            $jsonLine = '';
            for ($i = count($output) - 1; $i >= 0; $i--) {
                $trimmed = trim($output[$i]);
                if (! empty($trimmed)) {
                    $jsonLine = $trimmed;
                    break;
                }
            }

            if (empty($jsonLine)) {
                throw new \Exception('Não foi possível encontrar resultado JSON no output');
            }

            // Clean up any debug output before the JSON
            $jsonStartPos = strpos($jsonLine, '{');
            if ($jsonStartPos !== false && $jsonStartPos > 0) {
                $jsonLine = substr($jsonLine, $jsonStartPos);
            }

            $result = json_decode($jsonLine, true);

            if (! $result || ! isset($result['success']) || ! $result['success']) {
                $errorMsg = $result['error'] ?? json_last_error_msg() ?? 'Erro desconhecido ao executar scraper';
                throw new \Exception($errorMsg);
            }

            if (! $result || ! isset($result['success']) || ! $result['success']) {
                $error = $result['error'] ?? 'Erro desconhecido ao executar scraper';
                throw new \Exception($error);
            }

            $metas = $result['metas'] ?? [];
            Log::info('[LdoMetasPrioridadesScraperService] Processado', ['count' => count($metas)]);

            return $metas;

        } catch (\Exception $e) {
            Log::error('[LdoMetasPrioridadesScraperService] Erro', ['message' => $e->getMessage()]);
            throw new \Exception('Erro ao buscar metas e prioridades: '.$e->getMessage());
        }
    }

    public function importToDatabase(array $metas, int $ldoId): array
    {
        $sucesso = 0;
        $ignorados = 0;
        $erros = [];

        \Illuminate\Support\Facades\DB::beginTransaction();

        try {
            foreach ($metas as $meta) {
                try {
                    $existente = MetaPrioridadeLdo::where('ldo_id', $ldoId)
                        ->where('descricao', $meta['descricao'])
                        ->first();

                    if ($existente) {
                        $ignorados++;

                        continue;
                    }

                    MetaPrioridadeLdo::create([
                        'ldo_id' => $ldoId,
                        'acao_codigo' => $meta['acao_codigo'] ?? null,
                        'funcao_codigo' => $meta['funcao_codigo'] ?? null,
                        'subfuncao_codigo' => $meta['subfuncao_codigo'] ?? null,
                        'descricao' => $meta['descricao'] ?? '',
                        'meta_fisica_prevista' => $meta['meta_fisica_prevista'] ?? null,
                        'unidade_medida' => $meta['unidade_medida'] ?? null,
                        'valor_financeiro_previsto' => $meta['valor_financeiro_previsto'] ?? 0,
                        'valor_empenhado' => $meta['valor_empenhado'] ?? null,
                        'valor_liquidado' => $meta['valor_liquidado'] ?? null,
                        'valor_pago' => $meta['valor_pago'] ?? null,
                    ]);

                    $sucesso++;
                } catch (\Exception $e) {
                    Log::error('[LdoMetasPrioridadesScraperService] Erro ao importar meta', [
                        'descricao' => $meta['descricao'] ?? 'unknown',
                        'erro' => $e->getMessage(),
                    ]);
                    $erros[] = [
                        'descricao' => $meta['descricao'] ?? 'unknown',
                        'erro' => $e->getMessage(),
                    ];
                }
            }

            if (count($erros) > 0 && $sucesso === 0) {
                \Illuminate\Support\Facades\DB::rollBack();
            } else {
                \Illuminate\Support\Facades\DB::commit();
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            Log::error('[LdoMetasPrioridadesScraperService] Erro fatal na importação', [
                'erro' => $e->getMessage(),
            ]);

            return [
                'sucesso' => 0,
                'ignorados' => 0,
                'erros' => [['descricao' => 'geral', 'erro' => $e->getMessage()]],
            ];
        }

        Log::info('[LdoMetasPrioridadesScraperService] Importação concluída', [
            'ldo_id' => $ldoId,
            'sucesso' => $sucesso,
            'ignorados' => $ignorados,
            'erros_count' => count($erros),
        ]);

        return [
            'sucesso' => $sucesso,
            'ignorados' => $ignorados,
            'erros' => $erros,
        ];
    }

    public function findLdoByAno(int $ano): ?Ldo
    {
        return Ldo::where('ano', $ano)->first();
    }
}
