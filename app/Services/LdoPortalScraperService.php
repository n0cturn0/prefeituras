<?php

namespace App\Services;

use App\Models\Ldo;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\DomCrawler\Crawler;

class LdoPortalScraperService
{
    protected string $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    public function scrape(string $portalUrl, ?int $ano = null): array
    {
        Log::info('[LdoPortalScraperService] Iniciando scrape', ['url' => $portalUrl, 'ano' => $ano]);

        try {
            $html = $this->fetchPage($portalUrl);
            Log::info('[LdoPortalScraperService] HTML capturado', ['size' => strlen($html)]);

            $config = $this->extractConfig($html, $portalUrl);
            Log::info('[LdoPortalScraperService] Config extraída', $config);

            if (! $config['entityLink'] || ! $config['baseUrl']) {
                throw new \Exception('Não foi possível extrair configuração do portal. Verifique a URL.');
            }

            $documentos = $this->fetchDocuments($config['entityLink'], $config['baseUrl'], $ano);
            Log::info('[LdoPortalScraperService] Documentos brutos da API', ['count' => count($documentos), 'ano_filtro' => $ano]);

            $result = $this->processDocuments($documentos, $config['baseUrl'], $ano);
            Log::info('[LdoPortalScraperService] Documentos processados', ['count' => count($result), 'ano_filtro' => $ano]);

            return $result;

        } catch (\Exception $e) {
            Log::error('[LdoPortalScraperService] Erro no scrape', [
                'message' => $e->getMessage(),
                'url' => $portalUrl,
                'trace' => $e->getTraceAsString(),
            ]);
            throw new \Exception('Erro ao buscar documentos: '.$e->getMessage());
        }
    }

    protected function fetchPage(string $url): string
    {
        $response = Http::withoutVerifying()
            ->withHeaders([
                'User-Agent' => $this->userAgent,
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language' => 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
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

        $crawler->filter('input#entityLink, input[name="entityLink"], input[id="entityLink"]')->each(function (Crawler $node) use (&$entityLink) {
            if (! $entityLink) {
                $entityLink = $node->attr('value');
            }
        });

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

        $crawler->filter('input#base-url, input[name="baseUrl"], input[id="base-url"]')->each(function (Crawler $node) use (&$baseUrl) {
            if (! $baseUrl) {
                $baseUrl = $node->attr('value');
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

    protected function fetchDocuments(string $entityLink, string $baseUrl, ?int $ano = null): array
    {
        $parsed = parse_url($baseUrl);
        $entityBase = $baseUrl.$entityLink;

        Log::info('[LdoPortalScraperService] entityBase:', [$entityBase, 'ano_filtro' => $ano]);

        $documentos = [];

        try {
            // Se ano específico foi selecionado, gerar URL diretamente
            if ($ano) {
                Log::info('[LdoPortalScraperService] Gerando PDF para ano específico:', [$ano]);
                $pdfUrl = $entityBase.'/pdfLDO?ano='.$ano.'&rel=sim';

                $documentos[] = [
                    'data' => '01/01/'.$ano,
                    'titulo' => 'LDO '.$ano,
                    'pdf_url' => $pdfUrl,
                    'ano' => (int) $ano,
                ];

                return $documentos;
            }

            // 1. Tentar buscar anos disponíveis - endpoint pode ser diferente do PPA
            $anosEndpoint = $entityBase.'/busca-ano-ldo';
            Log::info('[LdoPortalScraperService] Buscando anos de:', [$anosEndpoint]);

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
                $anos = $this->extractYearsFromResponse($anosData);
                Log::info('[LdoPortalScraperService] Anos extraidos:', $anos);
            }

            // 2. Buscar documentos de LDO
            $docsEndpoint = $entityBase.'/busca-ldo';
            Log::info('[LdoPortalScraperService] Buscando documentos de:', [$docsEndpoint]);

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
                    'acao' => 'findLdo',
                    'entidade' => '4',
                ]);

            if ($responseDocs->successful()) {
                $docsData = $responseDocs->json();
                Log::info('[LdoPortalScraperService] Documentos LDO:', (array) $docsData);

                if ($docsData && is_array($docsData)) {
                    foreach ($docsData as $doc) {
                        if (isset($doc['id']) && isset($doc['arquivo'])) {
                            $data = $doc['data'] ?? date('01/01/Y');
                            $titulo = $doc['arquivo'];

                            $anoDoc = $this->extractYearFromTitle($titulo);

                            if (! $anoDoc) {
                                $anoDoc = $this->extractYearFromDate($data);
                            }

                            // URL do PDF da LDO - padrão pode ser /pdfLDO?ano=X
                            $pdfUrl = $entityBase.'/pdfLDO?ano='.$anoDoc.'&rel=sim';

                            $documentos[] = [
                                'data' => $data,
                                'titulo' => $titulo,
                                'pdf_url' => $pdfUrl,
                                'ano' => $anoDoc,
                                'document_id' => $doc['id'],
                            ];
                        }
                    }
                }
            }

            // 3. Se não encontrou documentos, gerar PDFs para anos recentes
            if (empty($documentos)) {
                Log::info('[LdoPortalScraperService] Gerando PDFs para anos recentes');
                $anos = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'];
                foreach ($anos as $anoLoop) {
                    $pdfUrl = $entityBase.'/pdfLDO?ano='.$anoLoop.'&rel=sim';
                    $documentos[] = [
                        'data' => '01/01/'.$anoLoop,
                        'titulo' => 'LDO '.$anoLoop,
                        'pdf_url' => $pdfUrl,
                        'ano' => (int) $anoLoop,
                    ];
                }
            }
        } catch (\Exception $e) {
            Log::warning('[LdoPortalScraperService] Erro ao buscar documentos:', [
                'error' => $e->getMessage(),
            ]);
        }

        Log::info('[LdoPortalScraperService] Total documentos encontrados:', [count($documentos)]);

        return $documentos;
    }

    protected function extractYearsFromResponse($data): array
    {
        $anos = [];

        if (is_array($data)) {
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

        if (empty($anos)) {
            $anos = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];
        }

        return array_unique($anos);
    }

    protected function processDocuments(array $documentos, string $baseUrl, ?int $ano = null): array
    {
        $result = [];

        foreach ($documentos as $doc) {
            $data = $doc['data'] ?? null;
            $titulo = $doc['titulo'] ?? 'Documento LDO';
            $pdfUrl = $doc['pdf_url'] ?? null;
            $anoDoc = $doc['ano'] ?? null;

            if (! $anoDoc && $data) {
                $anoDoc = $this->extractYearFromDate($data);
            }

            // Filtrar por ano se especificado
            if ($ano && $anoDoc !== $ano) {
                continue;
            }

            if ($pdfUrl) {
                $result[] = [
                    'data' => $data,
                    'titulo' => $titulo,
                    'pdf_url' => $pdfUrl,
                    'ano' => $anoDoc,
                ];
            }
        }

        return $result;
    }

    protected function extractYearFromDate(string $data): int
    {
        if (preg_match('/(\d{2})\/(\d{2})\/(\d{4})/', $data, $matches)) {
            return (int) $matches[3];
        }

        if (preg_match('/(\d{4})-(\d{2})-(\d{2})/', $data, $matches)) {
            return (int) $matches[1];
        }

        if (preg_match('/(20\d{2})/', $data, $matches)) {
            return (int) $matches[1];
        }

        return (int) date('Y');
    }

    protected function extractYearFromTitle(string $titulo): ?int
    {
        // Tentar formato "LDO 2024" ou "Lei 1234/2024 LDO"
        if (preg_match('/LDO\s*(\d{4})/i', $titulo, $matches)) {
            return (int) $matches[1];
        }

        // Tentar formato "2024" como ano
        if (preg_match('/(20\d{2})/', $titulo, $matches)) {
            return (int) $matches[1];
        }

        return null;
    }

    public function uploadToLocal(array $documento): bool
    {
        try {
            $existente = Ldo::where('ano', $documento['ano'])->first();

            if ($existente) {
                Log::info('[LdoPortalScraperService] LDO já existe para o ano: '.$documento['ano']);

                return false;
            }

            $pdfContent = $this->downloadPdf($documento['pdf_url']);

            if (! $pdfContent) {
                Log::warning('[LdoPortalScraperService] Falha ao baixar PDF: '.$documento['pdf_url']);

                return false;
            }

            $tempFile = tempnam(sys_get_temp_dir(), 'ldo_');
            file_put_contents($tempFile, $pdfContent);

            $filename = 'ldo_'.$documento['ano'].'_'.time().'.pdf';
            $path = Storage::disk('public')->putFileAs('ldo_pdfs', new \Illuminate\Http\File($tempFile), $filename);

            Ldo::create([
                'ano' => $documento['ano'],
                'ementa' => $documento['titulo'] ?? 'LDO '.$documento['ano'],
                'status' => 'em_elaboracao',
                'pdf_lei' => $path,
            ]);

            @unlink($tempFile);

            Log::info('[LdoPortalScraperService] LDO importada com sucesso: '.$documento['ano']);

            return true;

        } catch (\Exception $e) {
            Log::error('[LdoPortalScraperService] Erro ao fazer upload:', [
                'error' => $e->getMessage(),
                'documento' => $documento,
            ]);

            return false;
        }
    }

    protected function downloadPdf(string $url): ?string
    {
        try {
            $response = Http::withoutVerifying()
                ->withHeaders([
                    'User-Agent' => $this->userAgent,
                ])
                ->timeout(60)
                ->get($url);

            if ($response->successful()) {
                $contentType = $response->header('Content-Type') ?? '';
                if (stripos($contentType, 'pdf') !== false || strlen($response->body()) > 1000) {
                    return $response->body();
                }
            }

            return null;
        } catch (\Exception $e) {
            return null;
        }
    }
}
