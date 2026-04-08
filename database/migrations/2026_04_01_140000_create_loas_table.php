<?php

/**
 * Migration: loas
 * Lei Orçamentária Anual conforme Art. 165 §5º da CF/88 e Art. 5º da LC 101/2000 (LRF).
 * Estima receitas e fixa despesas para o exercício financeiro,
 * devendo ser compatível com o PPA e a LDO vigentes.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('municipio_id')->nullable();
            $table->year('ano')->unique(); // Exercício financeiro de referência
            $table->date('data_envio_legislativo')->nullable();
            $table->date('data_devolucao_executivo')->nullable();
            $table->string('numero_texto_juridico', 20)->nullable(); // Nº da Lei ex: "Lei 1.234/2026"
            $table->text('ementa'); // Ementa da lei
            $table->string('pdf_lei')->nullable(); // Caminho do PDF
            $table->enum('status', ['em_elaboracao', 'enviado', 'aprovado', 'arquivado'])->default('em_elaboracao');
            // Art. 5º, III, "b" da LRF — reserva de contingência em %
            $table->decimal('reserva_contingencia_percentual', 5, 2)->default(0.00);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loas');
    }
};
