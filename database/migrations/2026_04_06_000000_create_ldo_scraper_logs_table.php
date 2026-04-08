<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ldo_scraper_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ldo_id')->nullable()->constrained('ldos')->nullOnDelete();
            $table->string('url', 2048);
            $table->enum('status', ['pending', 'success', 'failed', 'partial'])->default('pending');
            $table->text('erro')->nullable();
            $table->json('raw_data')->nullable();
            $table->integer('metas_encontradas')->default(0);
            $table->string('tipo_conteudo')->nullable();
            $table->string('municipio_origem')->nullable();
            $table->integer('tempo_processamento_ms')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ldo_scraper_logs');
    }
};
