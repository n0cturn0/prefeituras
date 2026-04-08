<?php

/**
 * Migration: ldos
 * Conforme Art. 4º da LC 101/2000 (LRF) e Resolução TCE-MS 88/2018.
 * A LDO compreende as metas e prioridades da administração pública,
 * orienta a elaboração da LOA, dispõe sobre alterações na legislação
 * tributária e estabelece a política de aplicação das agências financeiras.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ldos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('municipio_id')->nullable();
            $table->year('ano')->unique(); // Ano de referência da LDO
            $table->date('data_envio_legislativo')->nullable(); // Data de envio ao poder legislativo
            $table->date('data_devolucao_executivo')->nullable(); // Data de devolução ao executivo
            $table->string('pdf_lei')->nullable(); // Caminho do PDF da lei aprovada
            $table->text('ementa'); // Ementa da lei
            $table->enum('status', ['em_elaboracao', 'enviado', 'aprovado', 'arquivado'])->default('em_elaboracao');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ldos');
    }
};
