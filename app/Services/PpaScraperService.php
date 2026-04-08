<?php

namespace App\Services;

use App\Models\PpaScraperLog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;

/**
 * Service para scraping de PPA externo.
 *
 * Utiliza Python + pdfplumber/beautifulsoup4 para extrair dados de PPAs
 * de outras prefeituras/portais de transparência.
 *
 * O fluxo é:
 * 1. Validar URL
 * 2. Chamar script Python via Laravel Process
 * 3. Processar resultado JSON
 * 4. Salvar log de auditoria
 * 5. Retornar dados formatados para o frontend
 *
 * @see scripts/python/scraper_ppa.py Script Python que faz o scraping real
 */
class PpaScraperService
{
    /**
     * Caminho para o script Python de scraping.
     */
    protected string $pythonScriptPath;

    /**
     * Timeout em segundos para o scraping.
     */
    protected int $timeout = 120;

    public function __construct()
    {
        $this->pythonScriptPath = base_path('scripts/python/scraper_ppa.py');
    }

    /**
     * Realiza o scraping de uma URL externa de PPA.
     *
     * Este método:
     * 1. Valida se a URL é acessível
     * 2. Detecta o tipo de conteúdo (HTML ou PDF)
     * 3. Executa o script Python de scraping
     * 4. Processa o resultado e salva log de auditoria
     * 5. Retorna dados formatados para criação de PPA
     *
     * @param  string  $url  URL do PPA externo
     * @param  bool  $dryRun  Se true, apenas analisa sem retornar dados para persistência
     * @return array Dados extraídos ou array de erro
     */
    public function scrape(string $url, bool $dryRun = false): array
    {
        $startTime = microtime(true);

        $logData = [
            'url' => $url,
            'status' => 'pending',
        ];

        try {
            // 1. Validar URL
            if (! $this->isValidUrl($url)) {
                throw new \InvalidArgumentException('URL inválida. Forneça uma URL completa (http:// ou https://)');
            }

            // 2. Verificar se o script Python existe
            if (! file_exists($this->pythonScriptPath)) {
                throw new \RuntimeException(
                    "Script Python não encontrado em: {$this->pythonScriptPath}. ".
                    'Execute: mkdir -p scripts/python && pip install requests beautifulsoup4 pdfplumber pandas lxml'
                );
            }

            // 3. Executar scraping via Python
            $result = $this->executePythonScraper($url, $dryRun);

            // 4. Processar resultado
            $tempoProcessamento = (int) ((microtime(true) - $startTime) * 1000);

            if ($result['exit_code'] !== 0) {
                throw new \RuntimeException(
                    $result['stderr'] ?: 'Erro desconhecido ao executar scraper Python'
                );
            }

            $output = json_decode($result['stdout'], true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \RuntimeException('Resposta inválida do scraper: '.json_last_error_msg());
            }

            if ($output['success'] === false) {
                throw new \RuntimeException($output['error'] ?? 'Erro desconhecido no scraping');
            }

            // 5. Salvar log de auditoria
            $logData['status'] = $output['partial'] === true ? 'partial' : 'success';
            $logData['raw_data'] = $output['data'] ?? null;
            $logData['programas_encontrados'] = count($output['data']['programas'] ?? []);
            $logData['acoes_encontradas'] = count($output['data']['acoes'] ?? []);
            $logData['indicadores_encontrados'] = count($output['data']['indicadores'] ?? []);
            $logData['tipo_conteudo'] = $output['metadata']['tipo_conteudo'] ?? null;
            $logData['municipio_origem'] = $output['metadata']['municipio'] ?? null;
            $logData['tempo_processamento_ms'] = $tempoProcessamento;

            $this->saveLog($logData);

            // 6. Retornar dados formatados
            return [
                'success' => true,
                'data' => $this->formatDataForModels($output['data']),
                'metadata' => $output['metadata'],
            ];

        } catch (\Exception $e) {
            $tempoProcessamento = (int) ((microtime(true) - $startTime) * 1000);

            $logData['status'] = 'failed';
            $logData['erro'] = $e->getMessage();
            $logData['tempo_processamento_ms'] = $tempoProcessamento;

            $this->saveLog($logData);

            Log::error('PpaScraperService: Erro no scraping', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Valida se a URL é bem formatada.
     */
    protected function isValidUrl(string $url): bool
    {
        return filter_var($url, FILTER_VALIDATE_URL) !== false
            && in_array(parse_url($url, PHP_URL_SCHEME), ['http', 'https']);
    }

    /**
     * Executa o script Python de scraping.
     *
     * Usa Laravel Process para chamar o Python de forma segura,
     * com timeout e tratamento de erros.
     *
     * @param  string  $url  URL para fazer scraping
     * @param  bool  $dryRun  Modo dry-run
     * @return array Resultado com stdout, stderr e exit_code
     */
    protected function executePythonScraper(string $url, bool $dryRun = false): array
    {
        $command = [
            'python3',
            $this->pythonScriptPath,
            $url,
        ];

        if ($dryRun) {
            $command[] = '--dry-run';
        }

        $process = Process::command($command)
            ->timeout($this->timeout)
            ->idleTimeout($this->timeout)
            ->run();

        return [
            'stdout' => $process->output(),
            'stderr' => $process->errorOutput(),
            'exit_code' => $process->exitCode(),
        ];
    }

    /**
     * Formata os dados extraídos para corresponder aos models do Laravel.
     *
     * Este método mapeia os campos retornados pelo Python para os campos
     * esperados pelos models Ppa, Programa, Acao e Indicador.
     *
     * @param  array  $data  Dados brutos do Python
     * @return array Dados formatados para os models
     */
    protected function formatDataForModels(array $data): array
    {
        return [
            'ppa' => [
                'ano_inicio' => $data['ppa']['ano_inicio'] ?? null,
                'ano_fim' => $data['ppa']['ano_fim'] ?? null,
                'visao' => $data['ppa']['visao'] ?? '',
                'valores' => $data['ppa']['valores'] ?? '',
                'diretrizes' => $data['ppa']['diretrizes'] ?? '',
                'eixos_estrategicos' => $data['ppa']['eixos_estrategicos'] ?? [],
                'status' => 'em_vigor',
            ],
            'programas' => array_map(function ($programa) {
                return [
                    'codigo' => $programa['codigo'] ?? null,
                    'nome' => $programa['nome'] ?? '',
                    'objetivo' => $programa['objetivo'] ?? '',
                    'problema' => $programa['problema'] ?? '',
                    'publico_alvo' => $programa['publico_alvo'] ?? '',
                    'funcao_codigo' => $this->mapFuncao($programa['funcao'] ?? ''),
                    'subfuncao_codigo' => $this->mapSubfuncao($programa['subfuncao'] ?? ''),
                    'tipo_programa' => $programa['tipo_programa'] ?? 'finalístico',
                    'responsavel' => $programa['responsavel'] ?? '',
                    'unidade_gestora' => $programa['unidade_gestora'] ?? '',
                    'valor_global' => $this->parseMoney($programa['valor_global'] ?? 0),
                    'fonte_financiamento_fiscal' => $programa['fonte_fiscal'] ?? '',
                    'fonte_financiamento_seguridade' => $programa['fonte_seguridade'] ?? '',
                    'alinhamento_ods' => $programa['ods'] ?? [],
                    'meta_fisica_total' => $programa['meta_fisica'] ?? null,
                    'meta_financeira_total' => $this->parseMoney($programa['meta_financeira'] ?? 0),
                ];
            }, $data['programas'] ?? []),
            'acoes' => array_map(function ($acao) {
                return [
                    'codigo' => $acao['codigo'] ?? null,
                    'nome' => $acao['nome'] ?? '',
                    'descricao' => $acao['descricao'] ?? '',
                    'iniciativa' => $acao['iniciativa'] ?? '',
                    'objetivo_especifico' => $acao['objetivo_especifico'] ?? '',
                    'produto' => $acao['produto'] ?? '',
                    'unidade_medida' => $acao['unidade_medida'] ?? '',
                    'beneficiario' => $acao['beneficiario'] ?? '',
                    'meta_fisica_ano1' => $acao['meta_fisica_ano1'] ?? null,
                    'meta_fisica_ano2' => $acao['meta_fisica_ano2'] ?? null,
                    'meta_fisica_ano3' => $acao['meta_fisica_ano3'] ?? null,
                    'meta_fisica_ano4' => $acao['meta_fisica_ano4'] ?? null,
                    'valor_global_acao' => $this->parseMoney($acao['valor_global'] ?? 0),
                    'funcao_codigo' => $this->mapFuncao($acao['funcao'] ?? ''),
                    'subfuncao_codigo' => $this->mapSubfuncao($acao['subfuncao'] ?? ''),
                ];
            }, $data['acoes'] ?? []),
            'indicadores' => array_map(function ($indicador) {
                return [
                    'nome' => $indicador['nome'] ?? '',
                    'formula' => $indicador['formula'] ?? '',
                    'unidade_medida' => $indicador['unidade_medida'] ?? '',
                    'meta_ano1' => $indicador['meta_ano1'] ?? null,
                    'meta_ano2' => $indicador['meta_ano2'] ?? null,
                    'meta_ano3' => $indicador['meta_ano3'] ?? null,
                    'meta_ano4' => $indicador['meta_ano4'] ?? null,
                    'peso' => $indicador['peso'] ?? 1,
                ];
            }, $data['indicadores'] ?? []),
        ];
    }

    /**
     * Mapeia nome da função para código numérico.
     *
     * O PPA brasileiro usa códigos de função (01, 02, etc.)
     * que são mapeados a partir do nome extraído do PDF/HTML.
     *
     * @param  string  $nomeFuncao  Nome da função (ex: "Educação")
     * @return int|null Código da função ou null
     */
    protected function mapFuncao(string $nomeFuncao): ?int
    {
        $mapeamento = [
            'legislativa' => 1,
            'judiciária' => 2,
            'essencial à justiça' => 3,
            'administração' => 4,
            'defesa nacional' => 5,
            'segurança pública' => 6,
            'relações exteriores' => 7,
            'assistência social' => 8,
            'previdência social' => 9,
            'saúde' => 10,
            'trabalho' => 11,
            'educação' => 12,
            'cultura' => 13,
            'direitos da cidadania' => 14,
            'urbanismo' => 15,
            'habitação' => 16,
            'saneamento' => 17,
            'gestão ambiental' => 18,
            'ciência e tecnologia' => 19,
            'agricultura' => 20,
            'organização agrária' => 21,
            'industria' => 22,
            'comércio e serviços' => 23,
            'comunicações' => 24,
            'energia' => 25,
            'transporte' => 26,
            'desporto e lazer' => 27,
            'encargos especiais' => 28,
            'reserva de contingência' => 99,
        ];

        $nomeNormalizado = strtolower(trim($nomeFuncao));

        foreach ($mapeamento as $nome => $codigo) {
            if (str_contains($nomeNormalizado, $nome)) {
                return $codigo;
            }
        }

        return null;
    }

    /**
     * Mapeia nome da subfunção para código numérico.
     *
     * @param  string  $nomeSubfuncao  Nome da subfunção
     * @return int|null Código da subfunção ou null
     */
    protected function mapSubfuncao(string $nomeSubfuncao): ?int
    {
        // Mapeamento simplificado - em produção seria melhor ter uma tabela de referência
        $mapeamento = [
            'legislativa' => 1,
            'controle externo' => 2,
            'administração geral' => 122,
            'administração financeira' => 123,
            'tecnologia da informação' => 126,
            'formação de recursos humanos' => 128,
            'statísticas públicas' => 129,
            'educação infantil' => 361,
            'educação fundamental' => 362,
            'educação média' => 363,
            'educação superior' => 364,
            'educação profissional' => 365,
            'atenção básica' => 301,
            'atenção especializada' => 302,
            'vigilância sanitária' => 304,
            'vigilância epidemiológica' => 305,
            'assistência ao portador de deficiência' => 88,
            'assistência à criança e ao adolescente' => 243,
        ];

        $nomeNormalizado = strtolower(trim($nomeSubfuncao));

        foreach ($mapeamento as $nome => $codigo) {
            if (str_contains($nomeNormalizado, $nome)) {
                return $codigo;
            }
        }

        return null;
    }

    /**
     * Converte string de valor monetário para formato numérico.
     *
     * O Python pode retornar valores como "R$ 1.234.567,89"
     * e precisamos converter para 1234567.89
     *
     * @param  mixed  $value  Valor em qualquer formato
     */
    protected function parseMoney($value): ?float
    {
        if (empty($value)) {
            return null;
        }

        if (is_numeric($value)) {
            return (float) $value;
        }

        // Remove R$, espaços, pontos como separador de milhar
        $value = str_replace(['R$', ' ', '.'], '', $value);
        // Substitui vírgula por ponto
        $value = str_replace(',', '.', $value);

        return is_numeric($value) ? (float) $value : null;
    }

    /**
     * Salva log de auditoria do scraping.
     */
    protected function saveLog(array $data): PpaScraperLog
    {
        return PpaScraperLog::create($data);
    }
}
