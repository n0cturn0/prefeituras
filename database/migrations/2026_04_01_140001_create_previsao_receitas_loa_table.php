<?php

/**
 * Migration: previsao_receitas_loa
 * Previsão de Receitas conforme Art. 12 da LRF e Lei 4.320/1964 Art. 2º, §1º.
 * Demonstrativo da receita prevista por código de natureza de receita,
 * confrontando com valores constantes e realizados no exercício anterior.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('previsao_receitas_loa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loa_id')->constrained('loas')->onDelete('cascade');
            $table->string('codigo_receita', 20); // Código natureza de receita (ex: 1.1.1.2.04.0.0)
            $table->text('descricao'); // Descrição da receita
            $table->decimal('valor_previsto', 15, 2); // Valor previsto para o exercício
            $table->decimal('valor_constante', 15, 2)->nullable(); // Valor a preços constantes
            $table->decimal('valor_realizado_ano_anterior', 15, 2)->nullable(); // Realizado exercício anterior
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('previsao_receitas_loa');
    }
};
