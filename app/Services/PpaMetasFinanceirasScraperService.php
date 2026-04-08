<?php

namespace App\Services;

use App\Models\Ppa;
use App\Models\Programa;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\DomCrawler\Crawler;

class PpaMetasFinanceirasScraperService
{
    protected string $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    /**
     * Extrai programas do relatório de metas financeiras do PPA.
     * Usa o script Python com Playwright para extrair dados do portal.
     */
    public function scrape(string $portalUrl, int $anoReferencia): array
    {
        Log::info('[PpaMetasFinanceirasScraperService] Iniciando scrape com Playwright', [
            'url' => $portalUrl,
            'ano' => $anoReferencia,
        ]);

        try {
            $scriptPath = base_path('scripts/python/scraper_ppa_metas.py');
            $venvPython = base_path('venv/bin/python');

            $command = $venvPython.' '.escapeshellarg($scriptPath).' '.escapeshellarg($portalUrl).' '.escapeshellarg($anoReferencia).' 2>&1';

            Log::info('[PpaMetasFinanceirasScraperService] Executando comando', ['command' => $command]);

            $output = [];
            $returnCode = 0;
            exec($command, $output, $returnCode);

            // Encontrar a linha JSON no output (pode estar em qualquer posição)
            $jsonLine = '';
            foreach ($output as $line) {
                $trimmed = trim($line);
                if (isset($trimmed[0]) && $trimmed[0] === '{') {
                    $jsonLine = $line;
                    break;
                }
            }

            if (empty($jsonLine)) {
                throw new \Exception('Não foi possível encontrar resultado JSON no output: '.implode("\n", $output));
            }

            $result = json_decode($jsonLine, true);

            if (! $result || ! isset($result['success']) || ! $result['success']) {
                $error = $result['error'] ?? 'Erro desconhecido ao executar scraper';
                throw new \Exception($error);
            }

            $programas = $result['programas'] ?? [];
            Log::info('[PpaMetasFinanceirasScraperService] Processado', ['count' => count($programas)]);

            return $programas;

        } catch (\Exception $e) {
            Log::error('[PpaMetasFinanceirasScraperService] Erro', ['message' => $e->getMessage()]);
            throw new \Exception('Erro ao buscar metas financeiras: '.$e->getMessage());
        }
    }

    protected function fetchPage(string $url): string
    {
        $response = Http::withoutVerifying()
            ->withHeaders([
                'User-Agent' => $this->userAgent,
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            ])
            ->timeout(30)
            ->get($url);

        if (! $response->successful()) {
            throw new \Exception('Erro ao acessar o portal: HTTP '.$response->status());
        }

        return $response->body();
    }

    protected function extractConfig(string $html, string $portalUrl): array
    {
        $crawler = new Crawler($html);

        $entityLink = null;
        $baseUrl = null;

        $crawler->filter('input#entityLink, input[name="entityLink"]')->each(function (Crawler $node) use (&$entityLink) {
            if (! $entityLink) {
                $entityLink = $node->attr('value');
            }
        });

        if (! $entityLink) {
            $path = parse_url($portalUrl, PHP_URL_PATH);
            $parts = explode('/', trim($path, '/'));
            $entityLink = end($parts);
        }

        if (! $baseUrl) {
            $parsed = parse_url($portalUrl);
            $path = trim($parsed['path'] ?? '', '/');
            $pathParts = explode('/', $path);
            array_pop($pathParts);
            $basePath = implode('/', $pathParts);
            $baseUrl = $parsed['scheme'].'://'.$parsed['host'].'/'.$basePath.'/';
        }

        return [
            'entityLink' => $entityLink,
            'baseUrl' => $baseUrl,
        ];
    }

    protected function fetchMetasFinanceiras(string $entityLink, string $baseUrl, int $ano): array
    {
        $entityBase = $baseUrl.$entityLink;
        $endpoint = $entityBase.'/busca-ppa-relatorio';

        Log::info('[PpaMetasFinanceirasScraperService] Fetching metas', ['endpoint' => $endpoint, 'ano' => $ano]);

        // Primeiro fazer um GET para obter cookies sessão
        Http::withoutVerifying()
            ->withHeaders([
                'User-Agent' => $this->userAgent,
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            ])
            ->timeout(30)
            ->get($entityBase);

        // Agora fazer a requisição POST com os headers corretos
        $response = Http::withoutVerifying()
            ->asForm()
            ->withHeaders([
                'User-Agent' => $this->userAgent,
                'X-Requested-With' => 'XMLHttpRequest',
                'Accept' => 'application/json, text/plain, */*',
                'Referer' => $entityBase,
                'Origin' => 'https://web.qualitysistemas.com.br',
            ])
            ->timeout(30)
            ->post($endpoint, [
                'entityLink' => $entityLink,
                'ano' => $ano,
                'rel' => 'nao',
            ]);

        if (! $response->successful()) {
            Log::warning('[PpaMetasFinanceirasScraperService] Response failed', ['status' => $response->status()]);

            return [];
        }

        $data = $response->json();
        Log::info('[PpaMetasFinanceirasScraperService] Data received', ['keys' => array_keys($data ?? [])]);

        return $data ?? [];
    }

    protected function processProgramas(array $data, int $anoReferencia): array
    {
        $programas = [];

        foreach ($data as $key => $programa) {
            if ($key === 'total' || ! is_array($programa)) {
                continue;
            }

            $codigo = $programa['codigo_programa'] ?? null;
            $nome = $programa['descricao_programa'] ?? null;
            $objetivo = $programa['objetivo_programa'] ?? null;

            if (! $codigo || ! $nome) {
                continue;
            }

            $valorGlobal = 0;
            $valorExecutado = 0;

            foreach ($programa as $atividade) {
                if (is_array($atividade) && isset($atividade['codigo_atividade'])) {
                    $valorInicial = $this->parseValor($atividade['valor_inicial'] ?? '0');
                    $valorAtualizado = $this->parseValor($atividade['valor_atualizado'] ?? '0');
                    $valorExec = $this->parseValor($atividade['valor_executado'] ?? '0');

                    $valorGlobal += $valorAtualizado;
                    $valorExecutado += $valorExec;
                }
            }

            $programas[] = [
                'codigo' => $codigo,
                'nome' => $nome,
                'objetivo' => $objetivo,
                'valor_global' => $valorGlobal,
                'meta_financeira_total' => $valorExecutado,
                'ano_referencia' => $anoReferencia,
            ];
        }

        return $programas;
    }

    protected function parseValor(string $valor): float
    {
        $valor = trim($valor);
        $valor = str_replace('.', '', $valor);
        $valor = str_replace(',', '.', $valor);

        return (float) $valor;
    }

    /**
     * Importa os programas para o banco de dados.
     */
    public function importToDatabase(array $programas, int $ppaId): array
    {
        $sucesso = 0;
        $ignorados = 0;
        $erros = [];

        \Illuminate\Support\Facades\DB::beginTransaction();

        try {
            foreach ($programas as $programa) {
                try {
                    $existente = Programa::where('ppa_id', $ppaId)
                        ->where('codigo', $programa['codigo'])
                        ->first();

                    if ($existente) {
                        $ignorados++;

                        continue;
                    }

                    $objetivo = ! empty($programa['objetivo'])
                        ? $programa['objetivo']
                        : 'Importado automaticamente do portal de transparência';

                    Programa::create([
                        'ppa_id' => $ppaId,
                        'codigo' => $programa['codigo'],
                        'nome' => $programa['nome'],
                        'objetivo' => $objetivo,
                        'problema' => null,
                        'publico_alvo' => null,
                        'funcao_codigo' => null,
                        'subfuncao_codigo' => null,
                        'tipo_programa' => 'finalistico',
                        'responsavel' => 'Importado automaticamente',
                        'unidade_gestora' => null,
                        'valor_global' => $programa['valor_global'] ?? 0,
                        'meta_financeira_total' => $programa['meta_financeira_total'] ?? 0,
                        'fonte_financiamento_fiscal' => 'S',
                        'fonte_financiamento_seguridade' => 'N',
                        'data_inicio' => null,
                        'data_fim' => null,
                    ]);

                    $sucesso++;
                } catch (\Exception $e) {
                    Log::error('[PpaMetasFinanceirasScraperService] Erro ao importar programa', [
                        'codigo' => $programa['codigo'] ?? 'unknown',
                        'erro' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                    $erros[] = [
                        'codigo' => $programa['codigo'],
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
            Log::error('[PpaMetasFinanceirasScraperService] Erro fatal na importação', [
                'erro' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'sucesso' => 0,
                'ignorados' => 0,
                'erros' => [['codigo' => 'geral', 'erro' => $e->getMessage()]],
            ];
        }

        Log::info('[PpaMetasFinanceirasScraperService] Importação concluída', [
            'ppa_id' => $ppaId,
            'sucesso' => $sucesso,
            'ignorados' => $ignorados,
            'erros_count' => count($erros),
            'erros' => $erros,
        ]);

        return [
            'sucesso' => $sucesso,
            'ignorados' => $ignorados,
            'erros' => $erros,
        ];
    }

    /**
     * Encontra PPA pelo ano de referência.
     */
    public function findPpaByAno(int $ano): ?Ppa
    {
        return Ppa::where('ano_inicio', '<=', $ano)
            ->where('ano_fim', '>=', $ano)
            ->first();
    }
}
