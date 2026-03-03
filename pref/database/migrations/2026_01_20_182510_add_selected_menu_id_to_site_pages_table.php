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
        Schema::table('site_pages', function (Blueprint $table) {
            $table->foreignUuid('selected_menu_id')->nullable()->after('sidebar_content')->constrained('site_menus')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('site_pages', function (Blueprint $table) {
            $table->dropForeign(['selected_menu_id']);
            $table->dropColumn('selected_menu_id');
        });
    }
};
