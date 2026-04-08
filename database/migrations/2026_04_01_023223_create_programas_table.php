<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('programas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ppa_id')->constrained('ppas')->onDelete('cascade');
            $table->string('codigo', 10);
            $table->string('nome', 255);
            $table->longText('objetivo');
            $table->longText('problema')->nullable();
            $table->string('publico_alvo', 255)->nullable();
            $table->string('funcao_codigo', 2)->nullable();
            $table->string('subfuncao_codigo', 3)->nullable();
            $table->enum('tipo_programa', ['finalistico', 'gestao_manutencao', 'operacoes_especiais'])->default('finalistico');
            $table->string('responsavel', 150)->nullable();
            $table->string('unidade_gestora', 100)->nullable();
            $table->decimal('valor_global', 15, 2)->nullable();
            $table->char('fonte_financiamento_fiscal', 1)->default('S');
            $table->char('fonte_financiamento_seguridade', 1)->default('N');
            $table->json('alinhamento_ods')->nullable();
            $table->decimal('meta_fisica_total', 15, 2)->nullable();
            $table->decimal('meta_financeira_total', 15, 2)->nullable();
            $table->date('data_inicio')->nullable();
            $table->date('data_fim')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['ppa_id', 'codigo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('programas');
    }
};
