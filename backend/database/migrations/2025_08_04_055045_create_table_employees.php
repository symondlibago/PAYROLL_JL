<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // 2025_08_04_055045_create_table_employees.php
public function up(): void
{
    Schema::create('employees', function (Blueprint $table) {
        $table->id();
        $table->string('id_number')->nullable();
        $table->string('name');
        $table->string('position');
        $table->integer('age')->nullable();
        $table->date('birthday')->nullable();
        $table->string('phone_number')->nullable();
        $table->text('address')->nullable();
        $table->string('group')->nullable();
        $table->date('date_started')->nullable();
        $table->integer('year_started')->nullable();
        $table->enum('status', ['Site', 'Office']);
        $table->decimal('rate', 10, 2);
        $table->decimal('monthly_rate', 10, 2)->nullable();
        $table->decimal('hourly_rate', 10, 2);
        
        // Financial & Banking
        $table->string('sss')->nullable();
        $table->string('philhealth')->nullable();
        $table->string('pagibig')->nullable();
        $table->string('tin')->nullable();
        $table->string('client_name')->nullable();
        $table->string('department_location')->nullable();
        $table->string('bank_account_number')->nullable();
        $table->string('bank_type')->nullable();
        
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
