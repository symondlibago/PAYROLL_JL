<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'employee_id',
        'name',
        'position',
        'age',
        'phone_number',
        'address',
        'group',
        'year_started',
        'status',
        'rate',
        'hourly_rate',
    ];
}

