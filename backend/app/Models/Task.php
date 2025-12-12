<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'assigned_employee_ids',
        'date',
        'location',
        'status',
        'priority',
        'category',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'assigned_employee_ids' => 'array',
        'date' => 'date',
    ];

    /**
     * Get the assigned employees for this task.
     */
    public function assignedEmployees()
    {
        return $this->belongsToMany(Employee::class, 'task_employee', 'task_id', 'employee_id');
    }

    /**
     * Get the comments for this task.
     */
    public function comments()
    {
        return $this->hasMany(TaskComment::class);
    }

    /**
     * Get the count of comments for this task.
     */
    public function getCommentsCountAttribute()
    {
        return $this->comments()->count();
    }

    /**
     * Get top-level comments with replies.
     */
    public function getCommentsWithReplies()
    {
        return TaskComment::getCommentsWithReplies($this->id);
    }
}

