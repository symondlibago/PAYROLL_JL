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
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->date('date')->default(now());
            $table->string('or_si_no');
            $table->text('description');
            $table->string('location');
            $table->string('store');
            $table->string('quantity'); // Changed from integer to string
            $table->string('size_dimension');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->string('mop'); // Mode of payment
            $table->text('mop_description')->nullable(); // MOP description
            $table->string('category');
            $table->longText('images')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};

