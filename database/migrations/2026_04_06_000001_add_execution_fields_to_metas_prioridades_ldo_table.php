<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('metas_prioridades_ldo', function (Blueprint $table) {
            $table->string('funcao_codigo', 2)->nullable()->after('acao_codigo');
            $table->string('subfuncao_codigo', 3)->nullable()->after('funcao_codigo');
            $table->decimal('valor_empenhado', 15, 2)->nullable()->after('valor_financeiro_previsto');
            $table->decimal('valor_liquidado', 15, 2)->nullable()->after('valor_empenhado');
            $table->decimal('valor_pago', 15, 2)->nullable()->after('valor_liquidado');
        });
    }

    public function down(): void
    {
        Schema::table('metas_prioridades_ldo', function (Blueprint $table) {
            $table->dropColumn(['funcao_codigo', 'subfuncao_codigo', 'valor_empenhado', 'valor_liquidado', 'valor_pago']);
        });
    }
};
