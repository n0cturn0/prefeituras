<?php

/**
 * Migration: reserva_contingencia_loa
 * Reserva de Contingência conforme Art. 5º, III da LRF.
 * Destinada ao atendimento de passivos contingentes e riscos fiscais
 * identificados no Anexo de Riscos Fiscais da LDO.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reserva_contingencia_loa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loa_id')->constrained('loas')->onDelete('cascade');
            $table->text('descricao'); // Descrição do risco/contingência atendido
            $table->decimal('valor_reserva', 15, 2); // Valor reservado
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reserva_contingencia_loa');
    }
};
