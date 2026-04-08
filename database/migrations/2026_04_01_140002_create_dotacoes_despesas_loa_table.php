<?php

/**
 * Migration: dotacoes_despesas_loa
 * Fixação de Despesas conforme Lei 4.320/1964 Art. 2º, §2º e Art. 15 da LRF.
 * Classificação funcional-programática com fonte de recursos,
 * vinculada obrigatoriamente ao Programa e Ação do PPA vigente.
 * Leiaute e-Sfinge TCE-MS — Manual v2.0 2026.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dotacoes_despesas_loa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loa_id')->constrained('loas')->onDelete('cascade');
            $table->string('funcao_codigo', 2); // Classificação funcional (Portaria 42/1999)
            $table->string('subfuncao_codigo', 3);
            $table->string('programa_codigo', 10); // Código do programa PPA
            $table->string('acao_codigo', 10); // Código da ação PPA
            $table->string('unidade_orcamentaria', 100); // Unidade orçamentária responsável
            $table->string('natureza_despesa', 10); // Ex: 3.1.90.11 (pessoal)
            $table->string('fonte_recursos', 10); // Fonte / destinação de recursos
            $table->decimal('valor_dotado', 15, 2); // Valor da dotação fixada
            $table->string('projeto_atividade', 255)->nullable(); // Descrição livre do projeto/atividade
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dotacoes_despesas_loa');
    }
};
