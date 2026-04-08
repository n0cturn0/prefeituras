<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Tabela para auditoria do scraper de PPA externo.
     * Armazena logs de scraping para debug e rastreabilidade.
     */
    public function up(): void
    {
        Schema::create('ppa_scraper_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ppa_id')->nullable()->constrained('ppas')->nullOnDelete();
            $table->string('url', 2048);
            $table->enum('status', ['pending', 'success', 'failed', 'partial'])->default('pending');
            $table->text('erro')->nullable();
            $table->json('raw_data')->nullable();
            $table->integer('programas_encontrados')->default(0);
            $table->integer('acoes_encontradas')->default(0);
            $table->integer('indicadores_encontrados')->default(0);
            $table->string('tipo_conteudo')->nullable();
            $table->string('municipio_origem')->nullable();
            $table->integer('tempo_processamento_ms')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ppa_scraper_logs');
    }
};
