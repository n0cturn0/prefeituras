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
        Schema::table('departments', function (Blueprint $table) {
            // Hierarquia: parent_id referencia o próprio departments.id
            $table->unsignedBigInteger('parent_id')->nullable()->after('id');
            $table->foreign('parent_id')->references('id')->on('departments')->onDelete('restrict');

            // Flag para identificar o nó raiz (Prefeitura)
            $table->boolean('is_root')->default(false)->after('parent_id');

            // Sigla (ex: SEMFAZ) — coluna já existia mas não estava no fillable
            if (!Schema::hasColumn('departments', 'acronym')) {
                $table->string('acronym', 20)->nullable()->after('is_root');
            }

            // Responsáveis
            $table->string('gestor')->nullable()->after('description');
            $table->string('representante_gestor')->nullable()->after('gestor');

            // Contato
            $table->string('phone', 30)->nullable()->after('representante_gestor');
            $table->string('fax', 30)->nullable()->after('phone');
            $table->string('email')->nullable()->after('fax');
            $table->string('site')->nullable()->after('email');

            // Endereço
            $table->string('cep', 10)->nullable()->after('site');
            $table->string('logradouro')->nullable()->after('cep');
            $table->string('bairro')->nullable()->after('logradouro');

            // Horário de atendimento (JSON): { "seg": {"inicio": "07:00", "fim": "13:00"}, ... }
            $table->json('horario_atendimento')->nullable()->after('bairro');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn([
                'parent_id',
                'is_root',
                'gestor',
                'representante_gestor',
                'phone',
                'fax',
                'email',
                'site',
                'cep',
                'logradouro',
                'bairro',
                'horario_atendimento',
            ]);

            if (Schema::hasColumn('departments', 'acronym')) {
                $table->dropColumn('acronym');
            }
        });
    }
};
