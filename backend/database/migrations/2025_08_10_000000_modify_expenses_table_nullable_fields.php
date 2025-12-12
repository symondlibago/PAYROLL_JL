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
        Schema::table('expenses', function (Blueprint $table) {
            // Modify columns to be nullable
            $table->date('date')->nullable()->change();
            $table->string('or_si_no')->nullable()->change();
            // Description remains required
            $table->string('location')->nullable()->change();
            $table->string('store')->nullable()->change();
            $table->string('quantity')->nullable()->change();
            $table->string('size_dimension')->nullable()->change();
            $table->decimal('unit_price', 10, 2)->nullable()->change();
            // Total price remains required
            $table->string('mop')->nullable()->change();
            // MOP description is already nullable
            $table->string('category')->nullable()->change();
            // Images is already nullable
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            // Revert columns to their original state
            $table->date('date')->nullable(false)->default(now())->change();
            $table->string('or_si_no')->nullable(false)->change();
            $table->string('location')->nullable(false)->change();
            $table->string('store')->nullable(false)->change();
            $table->string('quantity')->nullable(false)->change();
            $table->string('size_dimension')->nullable(false)->change();
            $table->decimal('unit_price', 10, 2)->nullable(false)->change();
            $table->string('mop')->nullable(false)->change();
            $table->string('category')->nullable(false)->change();
        });
    }
};