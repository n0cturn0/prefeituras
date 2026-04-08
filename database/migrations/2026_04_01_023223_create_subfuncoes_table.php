<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subfuncoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('funcao_id')->constrained('funcoes')->onDelete('cascade');
            $table->string('codigo', 3)->unique();
            $table->string('nome', 150);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subfuncoes');
    }
};
