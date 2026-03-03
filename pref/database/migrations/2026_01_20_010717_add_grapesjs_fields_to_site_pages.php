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
            $table->longText('content_html')->nullable()->after('content');
            $table->longText('content_css')->nullable()->after('content_html');
            $table->json('content_components')->nullable()->after('content_css');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('site_pages', function (Blueprint $table) {
            $table->dropColumn(['content_html', 'content_css', 'content_components']);
        });
    }
};
