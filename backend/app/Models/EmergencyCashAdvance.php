<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmergencyCashAdvance extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'emergency_cash_advances';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'employee_id',
        'amount',
        'remaining_balance',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'remaining_balance' => 'decimal:2',
    ];

    /**
     * Get the employee that owns the emergency cash advance.
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Scope a query to only include active emergency cash advances.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include completed emergency cash advances.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Check if the emergency cash advance is active.
     */
    public function isActive()
    {
        return $this->status === 'active';
    }

    /**
     * Check if the emergency cash advance is completed.
     */
    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    /**
     * Mark the emergency cash advance as completed.
     */
    public function markAsCompleted()
    {
        $this->update([
            'status' => 'completed',
            'remaining_balance' => 0
        ]);
    }

    /**
     * Deduct amount from remaining balance.
     */
    public function deductAmount($amount)
    {
        $newBalance = $this->remaining_balance - $amount;
        
        if ($newBalance <= 0) {
            $this->markAsCompleted();
            return true; // Indicates ECA is now completed
        } else {
            $this->update(['remaining_balance' => $newBalance]);
            return false; // Indicates ECA is still active
        }
    }
}

