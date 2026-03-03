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
        Schema::create('site_url_submenus', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('submenu_id')->constrained('site_submenus')->onDelete('cascade');
            $table->string('name');
            $table->string('url');
            $table->integer('position')->default(0);
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_url_submenus');
    }
};
