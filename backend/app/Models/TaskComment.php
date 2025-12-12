<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskComment extends Model
{
    use HasFactory;

    protected $table = 'task_comments';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'task_id',
        'author_name',
        'comment',
        'parent_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the task that owns the comment.
     */
    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Get the parent comment (for threaded comments).
     */
    public function parent()
    {
        return $this->belongsTo(TaskComment::class, 'parent_id');
    }

    /**
     * Get the child comments (replies).
     */
    public function replies()
    {
        return $this->hasMany(TaskComment::class, 'parent_id')->orderBy('created_at', 'asc');
    }

    /**
     * Scope to get only top-level comments (no parent).
     */
    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Get all comments with their replies in a nested structure.
     */
    public static function getCommentsWithReplies($taskId)
    {
        return self::where('task_id', $taskId)
            ->topLevel()
            ->with(['replies' => function ($query) {
                $query->orderBy('created_at', 'asc');
            }])
            ->orderBy('created_at', 'desc')
            ->get();
    }
}

