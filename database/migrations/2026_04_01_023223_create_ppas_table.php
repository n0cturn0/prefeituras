<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ppas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('municipio_id')->nullable(); // Exemplo de multiplo município
            $table->year('ano_inicio');
            $table->year('ano_fim');
            $table->longText('visao');
            $table->longText('valores')->nullable();
            $table->longText('diretrizes');
            $table->json('eixos_estrategicos')->nullable();
            $table->enum('status', ['em_vigor', 'revisao', 'arquivado'])->default('em_vigor');
            $table->string('pdf_lei_ppa')->nullable();
            $table->date('data_aprovacao_lei')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ppas');
    }
};
