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
    // Employee.php
    protected $fillable = [
        'id_number', 
        'name', 
        'position', 
        'age', 
        'birthday',
        'phone_number', 
        'address', 
        'group', 
        'date_started', 
        'year_started',
        'status', 
        'rate', 
        'monthly_rate', 
        'hourly_rate', 
        'sss', 
        'philhealth', 
        'pagibig',
        'tin', 
        'client_name', 
        'department_location', 
        'bank_account_number', 
        'bank_type'
    ];
}

