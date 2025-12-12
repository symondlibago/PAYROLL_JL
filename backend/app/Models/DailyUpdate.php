<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyUpdate extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'project_id',
        'date',
        'weather',
        'manpower',
        'activity',
        'images',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'images' => 'json', // Keep as json to handle base64 image data
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['image_data_urls'];

    /**
     * Get the project that owns the daily update.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the images as data URLs for frontend consumption.
     *
     * @return array
     */
    public function getImageDataUrlsAttribute()
    {
        if (!$this->images) {
            return [];
        }

        $images = is_string($this->images) ? json_decode($this->images, true) : $this->images;
        
        if (!is_array($images)) {
            return [];
        }

        return array_map(function ($image) {
            if (isset($image['data']) && isset($image['mime_type'])) {
                return 'data:' . $image['mime_type'] . ';base64,' . $image['data'];
            }
            return null;
        }, $images);
    }

    /**
     * Get image metadata without the base64 data for listing purposes.
     *
     * @return array
     */
    public function getImageMetadataAttribute()
    {
        if (!$this->images) {
            return [];
        }

        $images = is_string($this->images) ? json_decode($this->images, true) : $this->images;
        
        if (!is_array($images)) {
            return [];
        }

        return array_map(function ($image) {
            return [
                'original_name' => $image['original_name'] ?? 'Unknown',
                'mime_type' => $image['mime_type'] ?? 'Unknown',
                'size' => $image['size'] ?? 0,
            ];
        }, $images);
    }
}

