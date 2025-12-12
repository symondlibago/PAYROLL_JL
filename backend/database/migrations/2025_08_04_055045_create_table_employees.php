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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('employee_id')->unique(); // SEMP001, OEMP001, etc.
            $table->string('name');
            $table->string('position');
            $table->integer('age');
            $table->string('phone_number');
            $table->text('address');
            $table->text('group');
            $table->integer('year_started');
            $table->enum('status', ['Site', 'Office']);
            $table->decimal('rate', 10, 2); // Daily rate
            $table->decimal('hourly_rate', 10, 2); // Hourly rate (rate / 8)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
