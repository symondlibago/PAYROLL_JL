<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
    use HasFactory;

    protected $table = 'equipment';

    protected $fillable = [
        'equipment_name',
        'equipment_code',
        'brand',
        'serial_number',
        'item_status',
        'present_location',
        'borrowed_by',
        'date_borrowed',
        'status',
        'expected_return_date',
        'purpose_notes'
    ];

    protected $casts = [
        'date_borrowed' => 'date',
        'expected_return_date' => 'date'
    ];

    // Scope for available equipment
    public function scopeAvailable($query)
    {
        return $query->where('item_status', 'Available');
    }

    // Scope for borrowed equipment
    public function scopeBorrowed($query)
    {
        return $query->where('item_status', 'Borrowed');
    }

    // Scope for maintenance equipment
    public function scopeMaintenance($query)
    {
        return $query->where('item_status', 'Maintenance');
    }
}

