<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmergencyDeduction extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'emergency_deductions';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'employee_id',
        'amount',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
    ];

    /**
     * Get the employee that owns the emergency deduction.
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Scope a query to only include active emergency deductions.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include completed emergency deductions.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Check if the emergency deduction is active.
     */
    public function isActive()
    {
        return $this->status === 'active';
    }

    /**
     * Check if the emergency deduction is completed.
     */
    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    /**
     * Mark the emergency deduction as completed.
     */
    public function markAsCompleted()
    {
        $this->update(['status' => 'completed']);
    }
}

