<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Material extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'project',
        'project_location',
        'quantity',
        'date',
        'materials',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [];

    /**
     * Scope a query to only include materials with a specific status.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to search materials by project, location, or materials content.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $search
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('project', 'like', "%{$search}%")
              ->orWhere('project_location', 'like', "%{$search}%")
              ->orWhere('materials', 'like', "%{$search}%");
        });
    }

    /**
     * Scope a query to filter materials by date range.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Get the formatted date attribute.
     *
     * @return string
     */
    public function getFormattedDateAttribute()
    {
        return $this->date ? $this->date->format('Y-m-d') : null;
    }

    /**
     * Get the materials list as an array.
     *
     * @return array
     */
    public function getMaterialsListAttribute()
    {
        if (!$this->materials) {
            return [];
        }
        
        return array_filter(
            array_map('trim', explode("\n", $this->materials)),
            function ($item) {
                return !empty($item);
            }
        );
    }

    /**
     * Get the status badge color.
     *
     * @return string
     */
    public function getStatusColorAttribute()
    {
        return match ($this->status) {
            'approved' => 'green',
            'pending' => 'yellow',
            default => 'gray',
        };
    }

    /**
     * Check if the material is complete.
     *
     * @return bool
     */
    public function isApproved()
    {
        return $this->status === 'approved';
    }

    /**
     * Check if the material is pending.
     *
     * @return bool
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }

    /**
     * Mark the material as complete.
     *
     * @return bool
     */
    public function markAsApproved()
    {
        return $this->update(['status' => 'approved']);
    }

    /**
     * Mark the material as pending.
     *
     * @return bool
     */
    public function markAsPending()
    {
        return $this->update(['status' => 'pending']);
    }
}

