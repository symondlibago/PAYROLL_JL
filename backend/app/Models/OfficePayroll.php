<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OfficePayroll extends Model
{
    use HasFactory;

    // This allows ALL fields (including your new Days fields) to be saved
    protected $guarded = ['id'];

    protected $casts = [
        'pay_period_start' => 'date',
        'pay_period_end' => 'date',
        
        // --- MONEY FIELDS ---
        'basic_salary' => 'decimal:2',
        'holiday_pay' => 'decimal:2',
        'night_diff_pay' => 'decimal:2',
        'overtime_pay' => 'decimal:2',
        'allowance_amount' => 'decimal:2',
        'gross_pay' => 'decimal:2',
        'net_pay' => 'decimal:2',
        
        // --- DEDUCTIONS ---
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

        // --- NEW DAYS & HOURS FIELDS (Optional but recommended for precision) ---
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

        // Night Diff Days
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