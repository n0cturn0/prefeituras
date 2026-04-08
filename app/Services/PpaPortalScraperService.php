<?php

namespace App\Services;

use App\Models\Ppa;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\DomCrawler\Crawler;

/**
 * Service para scraping de PPA do Portal QualitySistemas.
 *
 * Utiliza a técnica da API interna EntityDataFinder para obter dados
 * sem precisar renderizar JavaScript.
 *
 * Fluxo:
 * 1. Fetch página HTML do portal
 * 2. Extrair entityLink e base-url do HTML
 * 3. Fazer request POST para API
 * 4. Parsear resposta JSON
 * 5. Retornar lista de documentos
 */
class PpaPortalScraperService
{
    protected string $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    /**
     * Extrai documentos de PPA do portal QualitySistemas.
     *
     * @param  string  $portalUrl  URL completa do portal (ex: https://web.qualitysistemas.com.br/planejamento_orcamentario/prefeitura_municipal_de_corguinho)
     * @return array Array de documentos encontrados
     */
    public function scrape(string $portalUrl): array
    {
        Log::info('[PpaPortalScraperService] Iniciando scrape', ['url' => $portalUrl]);

        try {
            // 1. Fetch da página HTML inicial para obter entityLink e base-url
            Log::info('[PpaPortalScraperService] Step 1: Fetch página HTML');
            $html = $this->fetchPage($portalUrl);
            Log::info('[PpaPortalScraperService] HTML capturado', ['size' => strlen($html)]);

            // 2. Extrair entityLink e base-url do HTML
            Log::info('[PpaPortalScraperService] Step 2: Extrair config do HTML');
            $config = $this->extractConfig($html, $portalUrl);
            Log::info('[PpaPortalScraperService] Config extraída', $config);

            if (! $config['entityLink'] || ! $config['baseUrl']) {
                throw new \Exception('Não foi possível extrair configuração do portal. Verifique a URL.');
            }

            // 3. Buscar documentos via API
            Log::info('[PpaPortalScraperService] Step 3: Buscar documentos via API');
            $documentos = $this->fetchDocuments($config['entityLink'], $config['baseUrl']);
            Log::info('[PpaPortalScraperService] Documentos brutos da API', ['count' => count($documentos)]);

            // 4. Processar e formatar documentos
            Log::info('[PpaPortalScraperService] Step 4: Processar documentos');
            $result = $this->processDocuments($documentos, $config['baseUrl']);
            Log::info('[PpaPortalScraperService] Documentos processados', ['count' => count($result)]);

            return $result;

        } catch (\Exception $e) {
            Log::error('[PpaPortalScraperService] Erro no scrape', [
                'message' => $e->getMessage(),
                'url' => $portalUrl,
                'trace' => $e->getTraceAsString(),
            ]);
            throw new \Exception('Erro ao buscar documentos: '.$e->getMessage());
        }
    }

    /**
     * Faz request para a página HTML do portal.
     */
    protected function fetchPage(string $url): string
    {
        Log::info('[PpaPortalScraperService] fetchPage URL:', [$url]);

        $response = Http::withoutVerifying()
            ->withHeaders([
                'User-Agent' => $this->userAgent,
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language' => 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            ])
            ->timeout(30)
            ->get($url);

        Log::info('[PpaPortalScraperService] Response status:', [$response->status()]);

        if (! $response->successful()) {
            throw new \Exception('Erro ao acessar o portal: HTTP '.$response->status());
        }

        return $response->body();
    }

    /**
     * Extrai entityLink e base-url do HTML da página.
     *
     * Conforme técnica QualitySistemas:
     * - <input id="entityLink" value="...">
     * - <input id="base-url" value="...">
     */
    protected function extractConfig(string $html, string $portalUrl): array
    {
        $crawler = new Crawler($html);

        $entityLink = null;
        $baseUrl = null;

        // Tentar encontrar entityLink
        $crawler->filter('input#entityLink, input[name="entityLink"], input[id="entityLink"]')->each(function (Crawler $node) use (&$entityLink) {
            if (! $entityLink) {
                $entityLink = $node->attr('value');
            }
        });

        // Se não encontrou, tentar em outros inputs hidden
        if (! $entityLink) {
            $crawler->filter('input[type="hidden"]')->each(function (Crawler $node) use (&$entityLink) {
                $id = $node->attr('id') ?? '';
                $name = $node->attr('name') ?? '';
                if (stripos($id, 'entity') !== false || stripos($name, 'entity') !== false) {
                    if (! $entityLink) {
                        $entityLink = $node->attr('value');
                    }
                }
            });
        }

        // Tentar encontrar base-url
        $crawler->filter('input#base-url, input[name="baseUrl"], input[id="base-url"]')->each(function (Crawler $node) use (&$baseUrl) {
            if (! $baseUrl) {
                $baseUrl = $node->attr('value');
            }
        });

        // Se entityLink ainda não foi encontrado, extrair da URL
        if (! $entityLink) {
            $path = parse_url($portalUrl, PHP_URL_PATH);
            $parts = explode('/', trim($path, '/'));
            $entityLink = end($parts);
        }

        // Se baseUrl não foi encontrado, construir a partir da URL original
        // O baseUrl deve ser o path base do portal, sem o entity no final
        // Ex: https://host/planejamento_orcamentario/ (não incluir entity)
        if (! $baseUrl) {
            $parsed = parse_url($portalUrl);
            $path = trim($parsed['path'] ?? '', '/');
            $pathParts = explode('/', $path);

            // Remover o último elemento (entityLink) do path para obter o baseUrl
            array_pop($pathParts);
            $basePath = implode('/', $pathParts);

            $baseUrl = $parsed['scheme'].'://'.$parsed['host'].'/'.$basePath.'/';
        }

        Log::info('[PpaPortalScraperService] extractConfig resultado:', [
            'entityLink' => $entityLink,
            'baseUrl' => $baseUrl,
        ]);

        return [
            'entityLink' => $entityLink,
            'baseUrl' => $baseUrl,
        ];
    }

    /**
     * Faz request para a API do portal e busca documentos de PPA.
     *
     * Fluxo correto:
     * 1. /busca-ano-ppa -> retorna anos disponíveis
     * 2. /busca-ppa -> retorna documentos (arquivos) com IDs
     * 3. /download-arquivo?file={id}&type=PPA -> download (requer sessão)
     * 4. Alternativa: /pdfPPA?ano={ano}&rel=sim -> gera PDF do relatório
     */
    protected function fetchDocuments(string $entityLink, string $baseUrl): array
    {
        Log::info('[PpaPortalScraperService] fetchDocuments entityLink:', [$entityLink]);
        Log::info('[PpaPortalScraperService] fetchDocuments baseUrl:', [$baseUrl]);

        $parsed = parse_url($baseUrl);
        $entityBase = $baseUrl.$entityLink;

        Log::info('[PpaPortalScraperService] entityBase:', [$entityBase]);

        $documentos = [];

        try {
            // 1. Buscar anos disponíveis
            $anosEndpoint = $entityBase.'/busca-ano-ppa';
            Log::info('[PpaPortalScraperService] Buscando anos de:', [$anosEndpoint]);

            $responseAnos = Http::withoutVerifying()
                ->asForm()
                ->withHeaders([
                    'User-Agent' => $this->userAgent,
                    'X-Requested-With' => 'XMLHttpRequest',
                    'Accept' => 'application/json, text/plain, */*',
                    'Referer' => $entityBase,
                ])
                ->timeout(30)
                ->post($anosEndpoint, [
                    'entityLink' => $entityLink,
                ]);

            $anos = [];
            if ($responseAnos->successful()) {
                $anosData = $responseAnos->json();
                Log::info('[PpaPortalScraperService] Dados de anos:', (array) $anosData);
                $anos = $this->extractYearsFromResponse($anosData);
                Log::info('[PpaPortalScraperService] Anos extraidos:', $anos);
            }

            // 2. Buscar documentos (arquivos) do PPA
            $docsEndpoint = $entityBase.'/busca-ppa';
            Log::info('[PpaPortalScraperService] Buscando documentos de:', [$docsEndpoint]);

            $responseDocs = Http::withoutVerifying()
                ->asForm()
                ->withHeaders([
                    'User-Agent' => $this->userAgent,
                    'X-Requested-With' => 'XMLHttpRequest',
                    'Accept' => 'application/json, text/plain, */*',
                    'Referer' => $entityBase,
                ])
                ->timeout(30)
                ->post($docsEndpoint, [
                    'acao' => 'findPpa',
                    'entidade' => '4', // entity ID from portal
                ]);

            if ($responseDocs->successful()) {
                $docsData = $responseDocs->json();
                Log::info('[PpaPortalScraperService] Documentos PPA:', (array) $docsData);

                if ($docsData && is_array($docsData)) {
                    foreach ($docsData as $doc) {
                        if (isset($doc['id']) && isset($doc['arquivo'])) {
                            $data = $doc['data'] ?? date('01/01/Y');
                            $titulo = $doc['arquivo'];

                            // Extrair ano do título (ex: "2018-2021" ou "PPA 2014 A 2017")
                            $ano = $this->extractYearFromTitle($titulo);

                            // Se não conseguiu extrair do título, usar a data
                            if (! $ano) {
                                $ano = $this->extractYearFromDate($data);
                            }

                            // Usar o PDF do relatório como alternativa ao download direto
                            $pdfUrl = $entityBase.'/pdfPPA?ano='.$ano.'&rel=sim';

                            $documentos[] = [
                                'data' => $data,
                                'titulo' => $titulo,
                                'pdf_url' => $pdfUrl,
                                'ano' => $ano,
                                'document_id' => $doc['id'],
                                'quadrienio' => $doc['quadrienio'] ?? null,
                            ];
                        }
                    }
                }
            }

            // 3. Se não encontrou documentos, gerar PDFs para cada ano disponível
            if (empty($documentos) && ! empty($anos)) {
                Log::info('[PpaPortalScraperService] Gerando PDFs para cada ano');
                foreach ($anos as $ano) {
                    $pdfUrl = $entityBase.'/pdfPPA?ano='.$ano.'&rel=sim';

                    $documentos[] = [
                        'data' => '01/01/'.$ano,
                        'titulo' => 'PPA '.$ano,
                        'pdf_url' => $pdfUrl,
                        'ano' => (int) $ano,
                    ];
                }
            }

            // 4. Último recurso: anos fixos
            if (empty($documentos)) {
                $anos = ['2026', '2025', '2024', '2022', '2021', '2020', '2018', '2017', '2016', '2014', '2012', '2010'];
                foreach ($anos as $ano) {
                    $pdfUrl = $entityBase.'/pdfPPA?ano='.$ano.'&rel=sim';
                    $documentos[] = [
                        'data' => '01/01/'.$ano,
                        'titulo' => 'PPA '.$ano,
                        'pdf_url' => $pdfUrl,
                        'ano' => (int) $ano,
                    ];
                }
            }
        } catch (\Exception $e) {
            Log::warning('[PpaPortalScraperService] Erro ao buscar documentos:', [
                'error' => $e->getMessage(),
            ]);
        }

        Log::info('[PpaPortalScraperService] Total documentos encontrados:', [count($documentos)]);

        return $documentos;
    }

    /**
     * Verifica se a resposta contém apenas lista de anos (sem documentos reais).
     */
    protected function isYearsOnlyResponse(array $data): bool
    {
        if (empty($data)) {
            return true;
        }

        // Verificar se todos os itens têm apenas EXE_ANO
        foreach ($data as $item) {
            if (! is_array($item)) {
                return false;
            }
            $keys = array_keys($item);
            if ($keys !== ['EXE_ANO'] && count($keys) > 1) {
                return false;
            }
            if (! isset($item['EXE_ANO'])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Extrai os anos da resposta de busca de anos.
     */
    protected function extractYearsFromResponse($data): array
    {
        $anos = [];

        if (is_array($data)) {
            // Se data é um array com anos
            foreach ($data as $item) {
                if (is_array($item)) {
                    if (isset($item['ano'])) {
                        $anos[] = $item['ano'];
                    } elseif (isset($item['value'])) {
                        $anos[] = $item['value'];
                    } elseif (isset($item['id'])) {
                        $anos[] = $item['id'];
                    }
                } elseif (is_string($item) || is_numeric($item)) {
                    $anos[] = $item;
                }
            }
        }

        // Se não encontrou, usar alguns anos padrão para testar
        if (empty($anos)) {
            $anos = ['2026', '2025', '2024', '2022', '2020', '2018', '2016', '2014'];
        }

        return array_unique($anos);
    }

    /**
     * Extrai documentos de PPA da resposta da API.
     *
     * A resposta pode ter diferentes formatos depending do endpoint.
     */
    protected function extractPpaFromResponse(array $data): array
    {
        $documentos = [];

        // Se data é um array com objetos que têm campos de documento
        foreach ($data as $item) {
            // Tentar encontrar documentos com dados de PPA
            if (isset($item['data']) || isset($item['Data']) || isset($item['DataDocumento'])) {
                $documentos[] = $item;
            }
        }

        // Se encontrou muitos itens, filtrar os que parecem ser PPA
        if (count($documentos) > 10) {
            $documentos = array_filter($documentos, function ($item) {
                $str = json_encode($item);

                return stripos($str, 'PPA') !== false
                    || stripos($str, 'Plano') !== false
                    || stripos($str, 'Plurianual') !== false;
            });
        }

        return array_values($documentos);
    }

    /**
     * Processa os documentos extraídos e formata para retorno.
     *
     * Extrai: data, titulo, pdf_url, ano
     */
    protected function processDocuments(array $documentos, string $baseUrl): array
    {
        $result = [];

        foreach ($documentos as $doc) {
            $data = $doc['data'] ?? null;
            $titulo = $doc['titulo'] ?? $doc['arquivo'] ?? 'Documento PPA';
            $pdfUrl = $doc['pdf_url'] ?? null;
            $ano = $doc['ano'] ?? null;

            if (! $ano && $data) {
                $ano = $this->extractYearFromDate($data);
            }

            if ($pdfUrl) {
                $result[] = [
                    'data' => $data,
                    'titulo' => $titulo,
                    'pdf_url' => $pdfUrl,
                    'ano' => $ano,
                ];
            }
        }

        return $result;
    }

    /**
     * Extrai URL do PDF do documento.
     */
    protected function extractPdfUrl(array $doc, string $baseUrl): ?string
    {
        // Tentar diferentes campos de URL
        $urlFields = ['pdf', 'link', 'url', 'arquivo', 'file', 'linkDownload', 'link_download', 'UrlDownload'];

        foreach ($urlFields as $field) {
            if (isset($doc[$field]) && ! empty($doc[$field])) {
                $url = $doc[$field];

                // Se for URL relativa, completar com baseUrl
                if (! filter_var($url, FILTER_VALIDATE_URL)) {
                    $url = rtrim($baseUrl, '/').'/'.ltrim($url, '/');
                }

                return $url;
            }
        }

        // Tentar encontrar em sub-objetos
        if (isset($doc['anexos']) && is_array($doc['anexos'])) {
            foreach ($doc['anexos'] as $anexo) {
                if (isset($anexo['url']) || isset($anexo['link'])) {
                    return $anexo['url'] ?? $anexo['link'];
                }
            }
        }

        return null;
    }

    /**
     * Extrai o ano de uma string de data.
     *
     * Aceita formatos: 30/03/2020, 2020-03-30, 2020, etc.
     */
    protected function extractYearFromDate(string $data): int
    {
        // Tentar extrair ano de data brasileira (dd/mm/yyyy)
        if (preg_match('/(\d{2})\/(\d{2})\/(\d{4})/', $data, $matches)) {
            return (int) $matches[3];
        }

        // Tentar extrair ano de data ISO (yyyy-mm-dd)
        if (preg_match('/(\d{4})-(\d{2})-(\d{2})/', $data, $matches)) {
            return (int) $matches[1];
        }

        // Tentar encontrar qualquer ano de 4 dígitos
        if (preg_match('/(20\d{2})/', $data, $matches)) {
            return (int) $matches[1];
        }

        // Default para ano atual
        return (int) date('Y');
    }

    /**
     * Extrai o ano do título do documento PPA.
     *
     * Aceita formatos: "2018-2021", "PPA 2014 A 2017", "LEI Nº 932.2021 PPA 2022-2025"
     */
    protected function extractYearFromTitle(string $titulo): ?int
    {
        // Tentar formato "2018-2021" ou "2021-2025"
        if (preg_match('/(20\d{2})\s*[-–]\s*(20\d{2})/', $titulo, $matches)) {
            return (int) $matches[1];
        }

        // Tentar formato "PPA 2014 A 2017" ou "PPA 2022-2025"
        if (preg_match('/PPA\s*(\d{4})/i', $titulo, $matches)) {
            return (int) $matches[1];
        }

        // Tentar formato "LEI Nº 932.2021 PPA 2022-2025" - pegar o segundo ano
        if (preg_match('/(20\d{2})\s*[-–]\s*(20\d{2})/', $titulo, $matches)) {
            return (int) $matches[2];
        }

        // Tentar qualquer ano de 4 dígitos no título
        if (preg_match('/(20\d{2})/', $titulo, $matches)) {
            return (int) $matches[1];
        }

        return null;
    }

    /**
     * Faz upload de um documento PPA para o sistema local.
     *
     * @param  array  $documento  Dados do documento (pdf_url, ano, titulo)
     * @return bool True se sucesso, false se erro
     */
    public function uploadToLocal(array $documento): bool
    {
        try {
            // 1. Verificar se já existe duplicado
            $existente = Ppa::where('ano_inicio', $documento['ano'])
                ->where('ano_fim', $documento['ano'])
                ->first();

            if ($existente) {
                return false; // Ignorar duplicado
            }

            // 2. Download do PDF
            $pdfContent = $this->downloadPdf($documento['pdf_url']);

            if (! $pdfContent) {
                return false;
            }

            // 3. Salvar PDF temporariamente
            $tempFile = tempnam(sys_get_temp_dir(), 'ppa_');
            file_put_contents($tempFile, $pdfContent);

            // 4. Criar PPA com arquivo
            $filename = 'ppa_'.$documento['ano'].'_'.time().'.pdf';
            $path = Storage::disk('public')->putFileAs('ppa_pdfs', new \Illuminate\Http\File($tempFile), $filename);

            Ppa::create([
                'ano_inicio' => $documento['ano'],
                'ano_fim' => $documento['ano'],
                'visao' => $documento['titulo'] ?? 'PPA '.$documento['ano'],
                'valores' => 'Importado automaticamente do Portal QualitySistemas',
                'diretrizes' => 'Importação automática via scraper',
                'status' => 'em_vigor',
                'pdf_lei_ppa' => $path,
            ]);

            // Limpar arquivo temporário
            @unlink($tempFile);

            return true;

        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Download do arquivo PDF.
     */
    protected function downloadPdf(string $url): ?string
    {
        try {
            $response = Http::withoutVerifying()
                ->withHeaders([
                    'User-Agent' => $this->userAgent,
                ])
                ->timeout(60)
                ->get($url);

            if ($response->successful() && $response->header('Content-Type', '')) {
                return $response->body();
            }

            return null;
        } catch (\Exception $e) {
            return null;
        }
    }
}
