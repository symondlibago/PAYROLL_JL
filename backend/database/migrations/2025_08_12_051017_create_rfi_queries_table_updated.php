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
        Schema::create('rfi_queries', function (Blueprint $table) {
            $table->id();
            $table->text('description');
            $table->date('date');
            $table->enum('status', ['pending', 'approved', 'reject'])->default('pending');
            $table->longText('images')->nullable(); // Changed to longText to store base64 encoded images
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rfi_queries');
    }
};

