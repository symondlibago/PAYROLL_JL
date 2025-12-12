<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'employee_id',
        'employee_name',
        'employee_group',
        'employee_code',
        'position',
        'payroll_type',
        'pay_period_start',
        'pay_period_end',
        'daily_rate',
        'hourly_rate',
        'working_days',
        'overtime_hours',
        'late_minutes',
        'daily_attendance', // Added
        'daily_overtime',   // Added
        'daily_late',       // Added
        'daily_site_address', // Added
        'basic_salary',
        'overtime_pay',
        'late_deduction',
        'cash_advance',
        'others_deduction',
        'gross_pay',
        'total_deductions',
        'net_pay',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'pay_period_start' => 'date',
        'pay_period_end' => 'date',
        'daily_rate' => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'overtime_hours' => 'decimal:2',
        'late_minutes' => 'decimal:2',
        'daily_attendance' => 'array',
        'daily_overtime' => 'array',   
        'daily_late' => 'array',
        'daily_site_address' => 'array',
        'basic_salary' => 'decimal:2',
        'overtime_pay' => 'decimal:2',
        'late_deduction' => 'decimal:2',
        'cash_advance' => 'decimal:2',
        'others_deduction' => 'decimal:2',
        'gross_pay' => 'decimal:2',
        'total_deductions' => 'decimal:2',
        'net_pay' => 'decimal:2',
    ];

    /**
     * Get the employee that owns the payroll.
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
