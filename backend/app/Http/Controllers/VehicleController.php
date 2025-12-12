<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class VehicleController extends Controller
{
    /**
     * Validation rules for vehicles.
     */
    private function validationRules(bool $isUpdate = false): array
    {
        return [
            'vehicle_name' => ($isUpdate ? 'sometimes|' : '') . 'required|string|max:255',
            'lto_renewal_date' => ($isUpdate ? 'sometimes|' : '') . 'required|date',
            'maintenance_date' => ($isUpdate ? 'sometimes|' : '') . 'nullable|date',
            'description' => 'nullable|string',
            'status' => ($isUpdate ? 'sometimes|' : '') . 'nullable|in:pending,complete',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif', // No size limit
        ];
    }

    /**
     * Handle image uploads and return structured data.
     */
    private function processImages($images): array
    {
        $data = [];
        foreach ($images as $image) {
            $content = file_get_contents($image->getRealPath());
            $data[] = [
                'data'          => base64_encode($content),
                'mime_type'     => $image->getMimeType(),
                'original_name' => $image->getClientOriginalName(),
                'size'          => strlen($content)
            ];
        }
        return $data;
    }

    /**
     * Return a JSON error response.
     */
    private function errorResponse(string $message, \Throwable $e, int $status = 500)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'error'   => $e->getMessage()
        ], $status);
    }

    /**
     * Get all vehicles with alert information
     */
    public function index(): JsonResponse
    {
        try {
            $vehicles = Vehicle::orderBy('created_at', 'desc')->get();
            
            // Add alert information to each vehicle
            $vehiclesWithAlerts = $vehicles->map(function ($vehicle) {
                return [
                    'id' => $vehicle->id,
                    'vehicle_name' => $vehicle->vehicle_name,
                    'lto_renewal_date' => $vehicle->lto_renewal_date,
                    'maintenance_date' => $vehicle->maintenance_date,
                    'description' => $vehicle->description,
                    'status' => $vehicle->status,
                    'images' => $vehicle->images,
                    'created_at' => $vehicle->created_at,
                    'updated_at' => $vehicle->updated_at,
                    'lto_renewal_alert' => $vehicle->lto_renewal_alert,
                    'maintenance_alert' => $vehicle->maintenance_alert,
                    'overall_alert' => $vehicle->overall_alert
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $vehiclesWithAlerts
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to fetch vehicles', $e);
        }
    }

    /**
     * Store a new vehicle
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), $this->validationRules());
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $imageData = $request->hasFile('images') 
                ? $this->processImages($request->file('images'))
                : [];

            $vehicle = Vehicle::create([
                'vehicle_name' => $request->vehicle_name,
                'lto_renewal_date' => $request->lto_renewal_date,
                'maintenance_date' => $request->maintenance_date,
                'description' => $request->description ?? '',
                'status' => $request->status ?? 'pending',
                'images' => json_encode($imageData),
            ]);

            // Add alert information to response
            $vehicleWithAlerts = [
                'id' => $vehicle->id,
                'vehicle_name' => $vehicle->vehicle_name,
                'lto_renewal_date' => $vehicle->lto_renewal_date,
                'maintenance_date' => $vehicle->maintenance_date,
                'description' => $vehicle->description,
                'status' => $vehicle->status,
                'images' => $vehicle->images,
                'created_at' => $vehicle->created_at,
                'updated_at' => $vehicle->updated_at,
                'lto_renewal_alert' => $vehicle->lto_renewal_alert,
                'maintenance_alert' => $vehicle->maintenance_alert,
                'overall_alert' => $vehicle->overall_alert
            ];

            return response()->json([
                'success' => true,
                'message' => 'Vehicle created successfully',
                'data' => $vehicleWithAlerts
            ], 201);

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to create vehicle', $e);
        }
    }

    /**
     * Show a specific vehicle
     */
    public function show($id): JsonResponse
    {
        try {
            $vehicle = Vehicle::find($id);

            if (!$vehicle) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vehicle not found'
                ], 404);
            }

            // Add alert information to response
            $vehicleWithAlerts = [
                'id' => $vehicle->id,
                'vehicle_name' => $vehicle->vehicle_name,
                'lto_renewal_date' => $vehicle->lto_renewal_date,
                'maintenance_date' => $vehicle->maintenance_date,
                'description' => $vehicle->description,
                'status' => $vehicle->status,
                'images' => $vehicle->images,
                'created_at' => $vehicle->created_at,
                'updated_at' => $vehicle->updated_at,
                'lto_renewal_alert' => $vehicle->lto_renewal_alert,
                'maintenance_alert' => $vehicle->maintenance_alert,
                'overall_alert' => $vehicle->overall_alert
            ];

            return response()->json([
                'success' => true,
                'data' => $vehicleWithAlerts
            ]);

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to fetch vehicle', $e);
        }
    }

    /**
     * Update a vehicle
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), $this->validationRules(true));
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $vehicle = Vehicle::find($id);

            if (!$vehicle) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vehicle not found'
                ], 404);
            }

            // Handle images - only update if new images are uploaded
            $imageData = null;
            if ($request->hasFile('images')) {
                // New images uploaded, replace existing ones
                $imageData = $this->processImages($request->file('images'));
            } else {
                // No new images, keep existing ones
                $imageData = is_string($vehicle->images) ? json_decode($vehicle->images, true) : $vehicle->images;
            }

            // Prepare update data - only include fields that are provided
            $updateData = [];
            
            if ($request->has('vehicle_name')) {
                $updateData['vehicle_name'] = $request->vehicle_name;
            }
            
            if ($request->has('lto_renewal_date')) {
                $updateData['lto_renewal_date'] = $request->lto_renewal_date;
            }
            
            if ($request->has('maintenance_date')) {
                $updateData['maintenance_date'] = $request->maintenance_date;
            }
            
            if ($request->has('description')) {
                $updateData['description'] = $request->description;
            }
            
            if ($request->has('status')) {
                $updateData['status'] = $request->status;
            }
            
            // Always update images (either new ones or existing ones)
            $updateData['images'] = json_encode($imageData);

            $vehicle->update($updateData);

            // Add alert information to response
            $vehicleWithAlerts = [
                'id' => $vehicle->id,
                'vehicle_name' => $vehicle->vehicle_name,
                'lto_renewal_date' => $vehicle->lto_renewal_date,
                'maintenance_date' => $vehicle->maintenance_date,
                'description' => $vehicle->description,
                'status' => $vehicle->status,
                'images' => $vehicle->images,
                'created_at' => $vehicle->created_at,
                'updated_at' => $vehicle->updated_at,
                'lto_renewal_alert' => $vehicle->lto_renewal_alert,
                'maintenance_alert' => $vehicle->maintenance_alert,
                'overall_alert' => $vehicle->overall_alert
            ];

            return response()->json([
                'success' => true,
                'message' => 'Vehicle updated successfully',
                'data' => $vehicleWithAlerts
            ]);

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to update vehicle', $e);
        }
    }

    /**
     * Delete a vehicle
     */
    public function destroy($id): JsonResponse
    {
        try {
            $vehicle = Vehicle::find($id);

            if (!$vehicle) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vehicle not found'
                ], 404);
            }

            // No need to delete files from storage since images are stored in database
            $vehicle->delete();

            return response()->json([
                'success' => true,
                'message' => 'Vehicle deleted successfully'
            ]);

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to delete vehicle', $e);
        }
    }

    /**
     * Update vehicle status
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => 'required|in:pending,complete'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $vehicle = Vehicle::find($id);

            if (!$vehicle) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vehicle not found'
                ], 404);
            }

            $vehicle->update([
                'status' => $request->status
            ]);

            // Add alert information to response
            $vehicleWithAlerts = [
                'id' => $vehicle->id,
                'vehicle_name' => $vehicle->vehicle_name,
                'lto_renewal_date' => $vehicle->lto_renewal_date,
                'maintenance_date' => $vehicle->maintenance_date,
                'description' => $vehicle->description,
                'status' => $vehicle->status,
                'images' => $vehicle->images,
                'created_at' => $vehicle->created_at,
                'updated_at' => $vehicle->updated_at,
                'lto_renewal_alert' => $vehicle->lto_renewal_alert,
                'maintenance_alert' => $vehicle->maintenance_alert,
                'overall_alert' => $vehicle->overall_alert
            ];

            return response()->json([
                'success' => true,
                'message' => 'Vehicle status updated successfully',
                'data' => $vehicleWithAlerts
            ]);

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to update vehicle status', $e);
        }
    }

    /**
     * Get vehicles by status
     */
    public function getByStatus($status): JsonResponse
    {
        try {
            if (!in_array($status, ['pending', 'complete'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid status. Must be pending or complete'
                ], 400);
            }

            $vehicles = Vehicle::where('status', $status)
                              ->orderBy('created_at', 'desc')
                              ->get();

            // Add alert information to each vehicle
            $vehiclesWithAlerts = $vehicles->map(function ($vehicle) {
                return [
                    'id' => $vehicle->id,
                    'vehicle_name' => $vehicle->vehicle_name,
                    'lto_renewal_date' => $vehicle->lto_renewal_date,
                    'maintenance_date' => $vehicle->maintenance_date,
                    'description' => $vehicle->description,
                    'status' => $vehicle->status,
                    'images' => $vehicle->images,
                    'created_at' => $vehicle->created_at,
                    'updated_at' => $vehicle->updated_at,
                    'lto_renewal_alert' => $vehicle->lto_renewal_alert,
                    'maintenance_alert' => $vehicle->maintenance_alert,
                    'overall_alert' => $vehicle->overall_alert
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $vehiclesWithAlerts
            ]);

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to fetch vehicles by status', $e);
        }
    }

    /**
     * Search vehicles
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q', '');

            if (empty($query)) {
                $vehicles = Vehicle::orderBy('created_at', 'desc')->get();
            } else {
                $vehicles = Vehicle::where('vehicle_name', 'LIKE', '%' . $query . '%')
                                  ->orWhere('description', 'LIKE', '%' . $query . '%')
                                  ->orWhere('status', 'LIKE', '%' . $query . '%')
                                  ->orderBy('created_at', 'desc')
                                  ->get();
            }

            // Add alert information to each vehicle
            $vehiclesWithAlerts = $vehicles->map(function ($vehicle) {
                return [
                    'id' => $vehicle->id,
                    'vehicle_name' => $vehicle->vehicle_name,
                    'lto_renewal_date' => $vehicle->lto_renewal_date,
                    'maintenance_date' => $vehicle->maintenance_date,
                    'description' => $vehicle->description,
                    'status' => $vehicle->status,
                    'images' => $vehicle->images,
                    'created_at' => $vehicle->created_at,
                    'updated_at' => $vehicle->updated_at,
                    'lto_renewal_alert' => $vehicle->lto_renewal_alert,
                    'maintenance_alert' => $vehicle->maintenance_alert,
                    'overall_alert' => $vehicle->overall_alert
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $vehiclesWithAlerts
            ]);

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to search vehicles', $e);
        }
    }

    /**
     * Get vehicles with alerts (for dashboard)
     */
    public function getVehicleAlerts(): JsonResponse
    {
        try {
            $vehicles = Vehicle::withAlerts()->get();
            
            $alerts = [];
            $warningCount = 0;
            $overdueCount = 0;

            foreach ($vehicles as $vehicle) {
                $ltoAlert = $vehicle->lto_renewal_alert;
                $maintenanceAlert = $vehicle->maintenance_alert;

                // Add LTO renewal alerts
                if ($ltoAlert['status'] !== 'none') {
                    $alerts[] = [
                        'vehicle_id' => $vehicle->id,
                        'vehicle_name' => $vehicle->vehicle_name,
                        'type' => 'lto_renewal',
                        'status' => $ltoAlert['status'],
                        'message' => $ltoAlert['message'],
                        'days_remaining' => $ltoAlert['days_remaining'],
                        'date' => $vehicle->lto_renewal_date
                    ];

                    if ($ltoAlert['status'] === 'overdue') {
                        $overdueCount++;
                    } else {
                        $warningCount++;
                    }
                }

                // Add maintenance alerts
                if ($maintenanceAlert['status'] !== 'none') {
                    $alerts[] = [
                        'vehicle_id' => $vehicle->id,
                        'vehicle_name' => $vehicle->vehicle_name,
                        'type' => 'maintenance',
                        'status' => $maintenanceAlert['status'],
                        'message' => $maintenanceAlert['message'],
                        'days_remaining' => $maintenanceAlert['days_remaining'],
                        'date' => $vehicle->maintenance_date
                    ];

                    if ($maintenanceAlert['status'] === 'overdue') {
                        $overdueCount++;
                    } else {
                        $warningCount++;
                    }
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'alerts' => $alerts,
                    'summary' => [
                        'total_alerts' => count($alerts),
                        'warning_count' => $warningCount,
                        'overdue_count' => $overdueCount,
                        'vehicles_with_alerts' => $vehicles->count()
                    ]
                ]
            ]);

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to fetch vehicle alerts', $e);
        }
    }
}

