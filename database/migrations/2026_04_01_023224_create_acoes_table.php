<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('acoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('programa_id')->constrained('programas')->onDelete('cascade');
            $table->string('codigo', 10);
            $table->string('nome', 255);
            $table->longText('descricao');
            $table->string('iniciativa', 255)->nullable();
            $table->longText('objetivo_especifico')->nullable();
            $table->string('produto', 255)->nullable();
            $table->string('unidade_medida', 50);
            $table->string('beneficiario', 255)->nullable();
            $table->decimal('meta_fisica_ano1', 15, 2)->nullable();
            $table->decimal('meta_fisica_ano2', 15, 2)->nullable();
            $table->decimal('meta_fisica_ano3', 15, 2)->nullable();
            $table->decimal('meta_fisica_ano4', 15, 2)->nullable();
            $table->decimal('valor_global_acao', 15, 2);
            $table->string('funcao_codigo', 2);
            $table->string('subfuncao_codigo', 3);
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['programa_id', 'codigo']); // Unique per program
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('acoes');
    }
};
