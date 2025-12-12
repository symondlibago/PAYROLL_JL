<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Vehicle extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'vehicle_name',
        'lto_renewal_date',
        'maintenance_date',
        'description',
        'status',
        'images',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'lto_renewal_date' => 'date',
        'maintenance_date' => 'date',
        'images' => 'json', // Keep as json to handle base64 image data
    ];

    /**
     * The attributes that should be mutated to dates.
     *
     * @var array
     */
    protected $dates = [
        'lto_renewal_date',
        'maintenance_date',
        'created_at',
        'updated_at',
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

    /**
     * Get LTO renewal alert status
     *
     * @return array
     */
    public function getLtoRenewalAlertAttribute()
    {
        if (!$this->lto_renewal_date) {
            return ['status' => 'none', 'message' => null, 'days_remaining' => null];
        }

        $today = Carbon::today();
        $renewalDate = Carbon::parse($this->lto_renewal_date);
        $daysUntilRenewal = $today->diffInDays($renewalDate, false);

        if ($daysUntilRenewal < 0) {
            // Overdue
            return [
                'status' => 'overdue',
                'message' => 'LTO renewal is overdue',
                'days_remaining' => $daysUntilRenewal
            ];
        } elseif ($daysUntilRenewal <= 3) {
            // Warning - 3 days or less
            return [
                'status' => 'warning',
                'message' => "LTO renewal due in {$daysUntilRenewal} day(s)",
                'days_remaining' => $daysUntilRenewal
            ];
        } else {
            // No alert needed
            return [
                'status' => 'none',
                'message' => null,
                'days_remaining' => $daysUntilRenewal
            ];
        }
    }

    /**
     * Get maintenance alert status
     *
     * @return array
     */
    public function getMaintenanceAlertAttribute()
    {
        if (!$this->maintenance_date) {
            return ['status' => 'none', 'message' => null, 'days_remaining' => null];
        }

        $today = Carbon::today();
        $maintenanceDate = Carbon::parse($this->maintenance_date);
        $daysUntilMaintenance = $today->diffInDays($maintenanceDate, false);

        if ($daysUntilMaintenance < 0) {
            // Overdue
            return [
                'status' => 'overdue',
                'message' => 'Maintenance is overdue',
                'days_remaining' => $daysUntilMaintenance
            ];
        } elseif ($daysUntilMaintenance <= 3) {
            // Warning - 3 days or less
            return [
                'status' => 'warning',
                'message' => "Maintenance due in {$daysUntilMaintenance} day(s)",
                'days_remaining' => $daysUntilMaintenance
            ];
        } else {
            // No alert needed
            return [
                'status' => 'none',
                'message' => null,
                'days_remaining' => $daysUntilMaintenance
            ];
        }
    }

    /**
     * Get overall alert status for the vehicle
     *
     * @return array
     */
    public function getOverallAlertAttribute()
    {
        $ltoAlert = $this->lto_renewal_alert;
        $maintenanceAlert = $this->maintenance_alert;

        // Determine the highest priority alert
        if ($ltoAlert['status'] === 'overdue' || $maintenanceAlert['status'] === 'overdue') {
            return [
                'status' => 'overdue',
                'priority' => 'high',
                'border_color' => 'red',
                'show_exclamation' => true
            ];
        } elseif ($ltoAlert['status'] === 'warning' || $maintenanceAlert['status'] === 'warning') {
            return [
                'status' => 'warning',
                'priority' => 'medium',
                'border_color' => 'yellow',
                'show_exclamation' => true
            ];
        } else {
            return [
                'status' => 'none',
                'priority' => 'low',
                'border_color' => 'default',
                'show_exclamation' => false
            ];
        }
    }

    /**
     * Scope to get vehicles with alerts
     */
    public function scopeWithAlerts($query)
    {
        return $query->where(function ($q) {
            $q->whereRaw('lto_renewal_date <= DATE_ADD(CURDATE(), INTERVAL 3 DAY)')
              ->orWhereRaw('maintenance_date <= DATE_ADD(CURDATE(), INTERVAL 3 DAY)');
        });
    }

    /**
     * Scope to get vehicles with overdue items
     */
    public function scopeOverdue($query)
    {
        return $query->where(function ($q) {
            $q->whereRaw('lto_renewal_date < CURDATE()')
              ->orWhereRaw('maintenance_date < CURDATE()');
        });
    }
}

