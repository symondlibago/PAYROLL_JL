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
        Schema::create("payrolls", function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("employee_id");
            $table->string("employee_name");
            $table->string("employee_group");
            $table->string("employee_code");
            $table->string("position");
            $table->enum("payroll_type", ["Site", "Office"]);
            $table->date("pay_period_start");
            $table->date("pay_period_end");
            $table->decimal("daily_rate", 10, 2);
            $table->decimal("hourly_rate", 10, 2);
            $table->integer("working_days");
            $table->decimal("overtime_hours", 8, 2);
            $table->decimal("late_minutes", 8, 2);
            $table->json('daily_site_address')->nullable();
            $table->json("daily_attendance")->nullable();
            $table->json("daily_overtime")->nullable();
            $table->json("daily_late")->nullable();
            $table->decimal("basic_salary", 10, 2);
            $table->decimal("overtime_pay", 10, 2);
            $table->decimal("late_deduction", 10, 2);
            $table->decimal("cash_advance", 10, 2);
            $table->decimal("others_deduction", 10, 2);
            $table->decimal("gross_pay", 10, 2);
            $table->decimal("total_deductions", 10, 2);
            $table->decimal("net_pay", 10, 2);
            $table->enum("status", ["Pending", "Processing", "Paid", "On Hold"])->default("Pending");
            $table->timestamps();

            // Foreign key constraint
            $table->foreign("employee_id")->references("id")->on("employees")->onDelete("cascade");
            
            // Indexes for better performance
            $table->index("employee_id");
            $table->index("payroll_type");
            $table->index("status");
            $table->index(["pay_period_start", "pay_period_end"]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("payrolls");
    }
};
