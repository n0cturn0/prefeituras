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
        Schema::create('protocolo_ouvidorias', function (Blueprint $table) {
            $table->id();
            $table->string('numero')->unique();
            $table->string('status')->default('Recebido');
            $table->foreignId('ouvidoria_id')->constrained('ouvidorias')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('protocolo_ouvidorias');
    }
};
