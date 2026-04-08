<?php

/**
 * Migration: metas_prioridades_ldo
 * Metas e Prioridades da LDO conforme Art. 165, §2º da CF/88.
 * Define as metas e prioridades para o exercício financeiro subsequente,
 * orientando a elaboração da LOA. Vinculação opcional com ações do PPA.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('metas_prioridades_ldo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ldo_id')->constrained('ldos')->onDelete('cascade');
            $table->string('acao_codigo', 10)->nullable(); // Código da ação do PPA vinculada
            $table->text('descricao'); // Descrição da meta/prioridade
            $table->decimal('meta_fisica_prevista', 15, 2)->nullable(); // Meta física prevista
            $table->string('unidade_medida', 50)->nullable(); // Unidade de medida da meta física
            $table->decimal('valor_financeiro_previsto', 15, 2); // Valor financeiro previsto
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('metas_prioridades_ldo');
    }
};
