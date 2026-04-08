<?php

/**
 * Migration: audiencias_publicas_ldo
 * Registro das audiências públicas realizadas durante a elaboração da LDO,
 * conforme Art. 48 da LRF e Art. 9º, §4º da LC 101/2000.
 * Requisito de transparência exigido pela Resolução TCE-MS 88/2018.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audiencias_publicas_ldo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ldo_id')->constrained('ldos')->onDelete('cascade');
            $table->date('data_primeira_convocacao'); // Data 1ª convocação (publicação edital)
            $table->date('data_audiencia'); // Data efetiva da audiência
            $table->string('local', 150); // Local de realização
            $table->enum('tipo_meio_comunicacao', [
                'diario_oficial',
                'jornal_impresso',
                'radio',
                'televisao',
                'internet',
                'mural_publico',
                'outro',
            ]); // Meio de divulgação da convocação
            $table->string('nome_veiculo', 150)->nullable(); // Nome do veículo de comunicação
            $table->text('observacoes')->nullable(); // Observações adicionais
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audiencias_publicas_ldo');
    }
};
