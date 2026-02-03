<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OfficePayroll extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'pay_period_start' => 'date',
        'pay_period_end' => 'date',
        
        // --- EARNINGS ---
        'basic_salary' => 'decimal:2',
        'holiday_pay' => 'decimal:2',
        'night_diff_pay' => 'decimal:2',
        'overtime_pay' => 'decimal:2',
        'allowance_amount' => 'decimal:2',
        
        // New Earnings
        'ecola' => 'decimal:2',
        'adjustment_1' => 'decimal:2',
        'adjustment_2' => 'decimal:2',
        
        'gross_pay' => 'decimal:2',
        'net_pay' => 'decimal:2',
        
        // --- DEDUCTIONS (Employee) ---
        'late_deduction' => 'decimal:2',
        'sss_deduction' => 'decimal:2',
        'philhealth_deduction' => 'decimal:2',
        'pagibig_deduction' => 'decimal:2',
        'proc_fee_deduction' => 'decimal:2',
        'gbond_deduction' => 'decimal:2',
        'uniform_deduction' => 'decimal:2',
        'sss_loan_deduction' => 'decimal:2',
        'pagibig_loan_deduction' => 'decimal:2',
        'sss_calamity_loan_deduction' => 'decimal:2',
        'pagibig_calamity_loan_deduction' => 'decimal:2',
        'others_deduction' => 'decimal:2',
        'total_deductions' => 'decimal:2',

        // --- EMPLOYER SHARES (New) ---
        'sss_employer_share' => 'decimal:2',
        'philhealth_employer_share' => 'decimal:2',
        'pagibig_employer_share' => 'decimal:2',

        // --- DAYS & HOURS FIELDS ---
        'sunday_rest_day_days' => 'decimal:2',
        'sunday_rest_day_hours' => 'decimal:2',
        'special_day_days' => 'decimal:2',
        'special_day_hours' => 'decimal:2',
        'special_day_rest_day_days' => 'decimal:2',
        'special_day_rest_day_hours' => 'decimal:2',
        'regular_holiday_days' => 'decimal:2',
        'regular_holiday_hours' => 'decimal:2',
        'regular_holiday_rest_day_days' => 'decimal:2',
        'regular_holiday_rest_day_hours' => 'decimal:2',
        'nd_ordinary_days' => 'decimal:2',
        'nd_ordinary_hours' => 'decimal:2',
        'nd_rest_special_days' => 'decimal:2',
        'nd_rest_special_hours' => 'decimal:2',
        'nd_regular_holiday_days' => 'decimal:2',
        'nd_regular_holiday_hours' => 'decimal:2',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}