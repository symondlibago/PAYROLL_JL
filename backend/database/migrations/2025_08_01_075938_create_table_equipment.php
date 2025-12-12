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
        Schema::create('equipment', function (Blueprint $table) {
            $table->id();
            $table->string('equipment_name');
            $table->string('equipment_code')->unique();
            $table->string('brand');
            $table->string('serial_number')->nullable();
            $table->enum('item_status', ['Available', 'Borrowed', 'Maintenance', 'Out of Service'])->default('Available');
            $table->string('present_location')->nullable();
            $table->string('borrowed_by')->nullable();
            $table->date('date_borrowed')->nullable();
            $table->enum('status', ['Excellent', 'Good', 'Fair', 'Poor'])->nullable();
            $table->date('expected_return_date')->nullable();
            $table->text('purpose_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment');
    }
};

