<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create("office_payrolls", function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("employee_id");
            $table->string("employee_name");
            $table->string("employee_group");
            $table->string("employee_code");
            $table->string("position");
            
            $table->date("pay_period_start");
            $table->date("pay_period_end");
            
            $table->decimal("daily_rate", 10, 2);
            $table->decimal("hourly_rate", 10, 2);
            
            $table->integer("total_working_days")->default(0);
            $table->decimal("total_late_minutes", 8, 2)->default(0);
            $table->decimal("total_overtime_hours", 8, 2)->default(0);
            
            $table->decimal("basic_salary", 10, 2)->default(0);
            $table->decimal("overtime_pay", 10, 2)->default(0);
            $table->decimal("gross_pay", 10, 2)->default(0);
            
            $table->decimal("late_deduction", 10, 2)->default(0);
            $table->decimal("sss_deduction", 10, 2)->default(0);
            $table->decimal("philhealth_deduction", 10, 2)->default(0);
            $table->decimal("pagibig_deduction", 10, 2)->default(0);
            $table->decimal("gbond_deduction", 10, 2)->default(0);
            $table->decimal("others_deduction", 10, 2)->default(0);
            $table->decimal("total_deductions", 10, 2)->default(0);
            
            $table->decimal("net_pay", 10, 2);
            // Added 'Released' status
            $table->enum("status", ["Pending", "Processing", "Paid", "Released", "On Hold"])->default("Pending");
            $table->timestamps();

            $table->foreign("employee_id")->references("id")->on("employees")->onDelete("cascade");
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("office_payrolls");
    }
};