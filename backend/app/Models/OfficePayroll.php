<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OfficePayroll extends Model
{
    use HasFactory;

    protected $guarded = ['id']; // Allow all fields to be mass assignable

    protected $casts = [
        'pay_period_start' => 'date',
        'pay_period_end' => 'date',
        // Cast all money fields to float/decimal for consistency
        'sss_deduction' => 'decimal:2',
        'philhealth_deduction' => 'decimal:2',
        'pagibig_deduction' => 'decimal:2',
        'gbond_deduction' => 'decimal:2',
        'net_pay' => 'decimal:2',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}