<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ouvidorias', function (Blueprint $table) {
            $table->id();
            $table->string('assunto');
            $table->string('departamento')->nullable();
            $table->string('tipo'); // Denúncia, Elogio, etc.
            $table->text('mensagem');
            $table->string('identificacao_tipo'); // sem_restricao, com_restricao, anonimo
            
            // Dados Identificação (nullable para anonimo)
            $table->string('nome')->nullable();
            $table->string('documento')->nullable(); // cpf
            $table->string('email')->nullable();
            $table->string('estado')->nullable();
            $table->string('cidade')->nullable();
            $table->string('cep')->nullable();
            $table->string('endereco')->nullable();
            $table->string('telefone1')->nullable();
            $table->string('telefone2')->nullable();
            
            $table->ipAddress('ip_address')->nullable();
            $table->timestamp('data_recebimento')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ouvidorias');
    }
};
