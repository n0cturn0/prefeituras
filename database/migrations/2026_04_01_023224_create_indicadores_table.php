<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('indicadores', function (Blueprint $table) {
            $table->id();
            // Um indicador pode pertencer a um programa inteiro ou a uma ação específica
            $table->foreignId('programa_id')->nullable()->constrained('programas')->onDelete('cascade');
            $table->foreignId('acao_id')->nullable()->constrained('acoes')->onDelete('cascade');
            
            $table->string('nome', 255);
            $table->text('formula');
            $table->string('unidade_medida', 50);
            $table->decimal('meta_ano1', 15, 2)->nullable();
            $table->decimal('meta_ano2', 15, 2)->nullable();
            $table->decimal('meta_ano3', 15, 2)->nullable();
            $table->decimal('meta_ano4', 15, 2)->nullable();
            $table->decimal('peso', 5, 2)->default(1.00);
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('indicadores');
    }
};
