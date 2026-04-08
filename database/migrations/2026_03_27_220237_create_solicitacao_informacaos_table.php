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
        Schema::create('solicitacao_informacaos', function (Blueprint $table) {
            $table->id();
            $table->string('tipo_pessoa'); // fisica, juridica
            $table->string('nome');
            $table->string('documento'); // cpf ou cnpj
            $table->string('email');
            $table->string('telefone')->nullable();
            $table->string('endereco')->nullable();
            $table->string('assunto');
            $table->text('descricao');
            $table->string('forma_recebimento');
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
        Schema::dropIfExists('solicitacao_informacaos');
    }
};
