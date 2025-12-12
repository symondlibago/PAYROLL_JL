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
        Schema::create("vehicles", function (Blueprint $table) {
            $table->id();
            $table->string("vehicle_name");
            $table->date("lto_renewal_date");
            $table->date('maintenance_date')->nullable();
            $table->text("description")->nullable();
            $table->string("status")->default("pending"); // pending, complete
            $table->longText("images")->nullable(); // Changed to longText to store base64 encoded images like RFI
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("vehicles");
    }
};

