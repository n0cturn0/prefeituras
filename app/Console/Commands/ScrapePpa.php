<?php

namespace App\Console\Commands;

use App\Services\PpaScraperService;
use Illuminate\Console\Command;

/**
 * Comando Artisan para scraping de PPA externo via linha de comando.
 *
 * Uso:
 * php artisan ppa:scrape {url}           - Analisa URL e retorna JSON com dados
 * php artisan ppa:scrape {url} --dry-run - Modo dry-run (apenas analisa)
 * php artisan ppa:scrape {url} --save    - Analisa e salva no banco
 *
 * Este comando é útil para:
 * - Testes de scraping
 * - Importação em batch via cron
 * - Debug de problemas de scraping
 */
class ScrapePpa extends Command
{
    protected $signature = 'ppa:scrape {url : URL do PPA externo para scraping}
                            {--dry-run : Apenas analisa URL sem processar dados}
                            {--save : Salva os dados extraídos no banco}';

    protected $description = 'Realiza scraping de PPA externo (PDF ou HTML)';

    public function __construct(
        protected PpaScraperService $scraperService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $url = $this->argument('url');
        $dryRun = $this->option('dry-run');
        $save = $this->option('save');

        if (! $this->confirm("Continuar com scraping de: {$url}?")) {
            $this->info('Operação cancelada.');

            return Command::SUCCESS;
        }

        $this->info('Iniciando scraping...');
        $this->newLine();

        try {
            $result = $this->scraperService->scrape($url, $dryRun);

            if (! $result['success']) {
                $this->error('Erro no scraping: '.$result['error']);

                return Command::FAILURE;
            }

            $this->info('Scraping realizado com sucesso!');
            $this->newLine();

            $data = $result['data'];
            $metadata = $result['metadata'];

            // Exibe resumo
            $this->line('📋 <fg=blue>Municipio:</> '.($metadata['municipio'] ?? 'Nao identificado'));
            $this->line('📄 <fg=blue>Tipo:</> '.($metadata['tipo_conteudo'] ?? 'desconhecido'));
            $this->newLine();

            // Resume dados do PPA
            $ppa = $data['ppa'];
            $this->line('<fg=yellow>=== Dados do PPA ===</>');
            $this->line('Periodo: '.($ppa['ano_inicio'] ?? '').' - '.($ppa['ano_fim'] ?? ''));
            $this->line('Visao: '.substr($ppa['visao'] ?? '', 0, 100).'...');
            $this->newLine();

            // Resumo programas
            $programas = $data['programas'];
            $programasCount = count($programas);
            $this->line('<fg=yellow>=== Programas ('.$programasCount.') ===</>');
            foreach (array_slice($programas, 0, 5) as $programa) {
                $this->line('  - ['.($programa['codigo'] ?? '').'] '.($programa['nome'] ?? ''));
            }
            if ($programasCount > 5) {
                $this->line('  ... e mais '.($programasCount - 5).' programas');
            }
            $this->newLine();

            // Resumo ações
            $acoes = $data['acoes'];
            $acoesCount = count($acoes);
            $this->line('<fg=yellow>=== Acoes ('.$acoesCount.') ===</>');
            $this->newLine();

            // Resumo indicadores
            $indicadores = $data['indicadores'];
            $indicadoresCount = count($indicadores);
            $this->line('<fg=yellow>=== Indicadores ('.$indicadoresCount.') ===</>');
            $this->newLine();

            // Se modo dry-run, mostra JSON completo
            if ($dryRun) {
                $this->line('<fg=cyan>JSON completo:</>');
                $this->newLine();
                $this->line(json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            }

            // Se opção --save, salva no banco
            if ($save && ! $dryRun) {
                if ($this->confirm('Deseja salvar os dados no banco?')) {
                    $this->call('ppa:scrape-save', [
                        'url' => $url,
                    ]);
                }
            }

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('Erro: '.$e->getMessage());

            return Command::FAILURE;
        }
    }
}
