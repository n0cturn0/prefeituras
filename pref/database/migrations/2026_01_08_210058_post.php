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
        //// database/migrations/xxxx_create_posts_table.php
Schema::create('posts', function (Blueprint $table) {
    $table->id();
    $table->foreignUuid('user_id')->constrained(); // Autor
    $table->foreignId('department_id')->constrained(); // Secretaria dona do post
    $table->string('title');
    $table->string('slug')->unique();
    $table->longText('content');
    $table->string('type')->default('news'); // news, law, edict, portal_content
    $table->enum('status', ['draft', 'pending', 'published'])->default('draft');
    $table->timestamp('published_at')->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
