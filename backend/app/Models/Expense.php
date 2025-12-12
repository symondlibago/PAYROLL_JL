<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'or_si_no',
        'description',
        'location',
        'store',
        'quantity', // Now string instead of integer
        'size_dimension',
        'unit_price',
        'total_price',
        'mop', // Mode of payment
        'mop_description', // MOP description
        'category',
        'images' // Multiple base64 encoded images
    ];

    protected $casts = [
        'date' => 'date',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'images' => 'json' // Keep as json to handle base64 image data
    ];

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

