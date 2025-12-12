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
        Schema::create('task_comments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('task_id');
            $table->string('author_name'); // For now, using name instead of user_id
            $table->text('comment');
            $table->unsignedBigInteger('parent_id')->nullable(); // For threaded comments
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('task_id')->references('id')->on('tasks')->onDelete('cascade');
            $table->foreign('parent_id')->references('id')->on('task_comments')->onDelete('cascade');
            
            // Indexes for better performance
            $table->index('task_id');
            $table->index('parent_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_comments');
    }
};

