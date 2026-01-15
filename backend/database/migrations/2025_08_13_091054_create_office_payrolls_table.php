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
            $table->string("employee_group")->nullable();
            $table->string("position");
            
            $table->date("pay_period_start");
            $table->date("pay_period_end");
            $table->string("mode_of_payment")->nullable();

            $table->decimal("daily_rate", 10, 2);
            $table->decimal("hourly_rate", 10, 2);
            
            // --- ATTENDANCE ---
            $table->decimal("total_days_worked", 8, 2)->default(0);
            $table->decimal("total_hours_worked", 8, 2)->default(0);
            $table->decimal("total_late_minutes", 8, 2)->default(0);

            // --- SPECIAL RATES (Days & Hours) ---
            $table->decimal("sunday_rest_day_days", 8, 2)->default(0);
            $table->decimal("sunday_rest_day_hours", 8, 2)->default(0);

            $table->decimal("special_day_days", 8, 2)->default(0);
            $table->decimal("special_day_hours", 8, 2)->default(0);

            $table->decimal("special_day_rest_day_days", 8, 2)->default(0);
            $table->decimal("special_day_rest_day_hours", 8, 2)->default(0);

            $table->decimal("regular_holiday_days", 8, 2)->default(0);
            $table->decimal("regular_holiday_hours", 8, 2)->default(0);

            $table->decimal("regular_holiday_rest_day_days", 8, 2)->default(0);
            $table->decimal("regular_holiday_rest_day_hours", 8, 2)->default(0);

            // --- NIGHT DIFFERENTIAL (Added Days) ---
            $table->decimal("nd_ordinary_days", 8, 2)->default(0);       // NEW
            $table->decimal("nd_ordinary_hours", 8, 2)->default(0);
            
            $table->decimal("nd_rest_special_days", 8, 2)->default(0);   // NEW
            $table->decimal("nd_rest_special_hours", 8, 2)->default(0);
            
            $table->decimal("nd_regular_holiday_days", 8, 2)->default(0); // NEW
            $table->decimal("nd_regular_holiday_hours", 8, 2)->default(0);

            // --- OVERTIME ---
            $table->decimal("ot_regular_hours", 8, 2)->default(0);
            $table->decimal("ot_rest_day_hours", 8, 2)->default(0);
            $table->decimal("ot_special_day_hours", 8, 2)->default(0);
            $table->decimal("ot_special_rest_day_hours", 8, 2)->default(0);
            $table->decimal("ot_regular_holiday_hours", 8, 2)->default(0);
            
            // --- COMPUTED EARNINGS ---
            $table->decimal("basic_salary", 10, 2)->default(0);
            $table->decimal("holiday_pay", 10, 2)->default(0);
            $table->decimal("night_diff_pay", 10, 2)->default(0);
            $table->decimal("overtime_pay", 10, 2)->default(0);
            $table->decimal("allowance_amount", 10, 2)->default(0);
            $table->string("allowance_remarks")->nullable();
            
            $table->decimal("gross_pay", 10, 2)->default(0);
            
            // --- DEDUCTIONS ---
            $table->decimal("late_deduction", 10, 2)->default(0);
            $table->decimal("sss_deduction", 10, 2)->default(0);
            $table->decimal("philhealth_deduction", 10, 2)->default(0);
            $table->decimal("pagibig_deduction", 10, 2)->default(0);
            $table->decimal("proc_fee_deduction", 10, 2)->default(0);
            $table->decimal("gbond_deduction", 10, 2)->default(0);
            $table->decimal("uniform_deduction", 10, 2)->default(0);
            $table->decimal("sss_loan_deduction", 10, 2)->default(0);
            $table->decimal("pagibig_loan_deduction", 10, 2)->default(0);
            $table->decimal("sss_calamity_loan_deduction", 10, 2)->default(0);
            $table->decimal("pagibig_calamity_loan_deduction", 10, 2)->default(0);
            $table->decimal("others_deduction", 10, 2)->default(0);
            $table->string("others_deduction_remarks")->nullable();

            $table->decimal("total_deductions", 10, 2)->default(0);
            $table->decimal("net_pay", 10, 2);
            
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