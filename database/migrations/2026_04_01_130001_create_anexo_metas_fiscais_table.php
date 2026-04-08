<?php

/**
 * Migration: anexo_metas_fiscais
 * Anexo de Metas Fiscais conforme Art. 4º, §1º da LRF (LC 101/2000).
 * Contém metas anuais de receitas, despesas, resultados nominal e primário
 * e montante da dívida pública para o exercício a que se referirem e para
 * os dois seguintes. Valores em preços correntes e constantes.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('anexo_metas_fiscais', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ldo_id')->constrained('ldos')->onDelete('cascade');
            $table->enum('tipo_meta', [
                'receita_total',
                'receita_primaria',
                'despesa_total',
                'despesa_primaria',
                'resultado_primario',
                'resultado_nominal',
                'divida_publica_consolidada',
                'divida_consolidada_liquida',
                'receitas_previdenciarias',
                'despesas_previdenciarias',
                'resultado_previdenciario',
            ]); // Tipos conforme demonstrativos da LRF
            $table->year('ano_meta'); // Ano de referência da meta
            $table->decimal('valor_previsto', 15, 2); // Valor corrente previsto
            $table->decimal('valor_constante', 15, 2)->nullable(); // Valor a preços constantes
            $table->decimal('valor_realizado_ano_anterior', 15, 2)->nullable(); // Realizado no exercício anterior
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anexo_metas_fiscais');
    }
};
