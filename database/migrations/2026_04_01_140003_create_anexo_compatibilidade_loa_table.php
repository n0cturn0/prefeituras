<?php

/**
 * Migration: anexo_compatibilidade_loa
 * Demonstrativo de compatibilidade da LOA com PPA e LDO,
 * conforme Art. 5º, I da LRF e Art. 165, §7º da CF/88.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('anexo_compatibilidade_loa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loa_id')->constrained('loas')->onDelete('cascade');
            $table->text('demonstrativo'); // Demonstrativo / descrição do item
            $table->text('objetivo_ppa')->nullable(); // Objetivo correspondente no PPA
            $table->text('meta_ldo')->nullable(); // Meta correspondente na LDO
            $table->decimal('valor_compatibilizado', 15, 2); // Valor compatibilizado
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anexo_compatibilidade_loa');
    }
};
