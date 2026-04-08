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
        Schema::create('subsections', function (Blueprint $table) {
            $table->uuid('uuid')->primary();
            $table->foreignUuid('section_id')->constrained('sections', 'uuid')->onDelete('cascade');
            $table->string('name');
            $table->boolean('status')->default(true);
            $table->uuidMorphs('content'); // Creates content_type (string) and content_id (uuid)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subsections');
    }
};
