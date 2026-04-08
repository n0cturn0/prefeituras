<?php

/**
 * Migration: anexo_riscos_fiscais
 * Anexo de Riscos Fiscais conforme Art. 4º, §3º da LRF.
 * Avalia os passivos contingentes e outros riscos capazes de
 * afetar as contas públicas, informando as providências a serem
 * tomadas, caso se concretizem.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('anexo_riscos_fiscais', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ldo_id')->constrained('ldos')->onDelete('cascade');
            $table->text('descricao'); // Descrição do risco fiscal identificado
            $table->decimal('valor_estimado', 15, 2); // Impacto financeiro estimado
            $table->text('providencia'); // Providência a ser tomada
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anexo_riscos_fiscais');
    }
};
