<?php

namespace App\Http\Controllers;

use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class MaterialController extends Controller
{
    /**
     * Display a listing of materials.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Material::query();

            // Apply status filter
            if ($request->has('status') && $request->status !== 'All') {
                $query->status($request->status);
            }

            // Apply search filter
            if ($request->has('search') && !empty($request->search)) {
                $query->search($request->search);
            }

            // Apply date range filter
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->dateRange($request->start_date, $request->end_date);
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $materials = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $materials->items(),
                'pagination' => [
                    'current_page' => $materials->currentPage(),
                    'last_page' => $materials->lastPage(),
                    'per_page' => $materials->perPage(),
                    'total' => $materials->total(),
                    'from' => $materials->firstItem(),
                    'to' => $materials->lastItem(),
                ],
                'message' => 'Materials retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving materials: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created material in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'project' => 'required|string|max:255',
                'project_location' => 'required|string|max:255',
                'quantity' => 'nullable|string|max:255',
                'date' => 'required|date',
                'materials' => 'nullable|string',
                'status' => 'required|in:pending,approved'
            ]);

            $material = Material::create($validatedData);

            return response()->json([
                'success' => true,
                'data' => $material,
                'message' => 'Material created successfully'
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating material: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified material.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id): JsonResponse
    {
        try {
            $material = Material::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $material,
                'message' => 'Material retrieved successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Material not found'
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving material: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified material in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $material = Material::findOrFail($id);

            $validatedData = $request->validate([
                'project' => 'required|string|max:255',
                'project_location' => 'required|string|max:255',
                'date' => 'required|date',
                'materials' => 'nullable|string',
                'quantity' => 'nullable|string',
                'status' => 'required|in:pending,approved'
            ]);

            $material->update($validatedData);

            return response()->json([
                'success' => true,
                'data' => $material->fresh(),
                'message' => 'Material updated successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Material not found'
            ], 404);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating material: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified material from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id): JsonResponse
    {
        try {
            $material = Material::findOrFail($id);
            $material->delete();

            return response()->json([
                'success' => true,
                'message' => 'Material deleted successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Material not found'
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting material: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the status of the specified material.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        try {
            $material = Material::findOrFail($id);

            $validatedData = $request->validate([
                'status' => 'required|in:pending,approved'
            ]);

            $material->update(['status' => $validatedData['status']]);

            return response()->json([
                'success' => true,
                'data' => $material->fresh(),
                'message' => 'Material status updated successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Material not found'
            ], 404);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating material status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get materials by status.
     *
     * @param  string  $status
     * @return \Illuminate\Http\JsonResponse
     */
    public function getByStatus($status): JsonResponse
    {
        try {
            if (!in_array($status, ['pending', 'approved'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid status. Must be pending or approved.'
                ], 400);
            }

            $materials = Material::status($status)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $materials,
                'message' => "Materials with status '{$status}' retrieved successfully"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving materials: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search materials.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $searchTerm = $request->get('q', '');
            
            if (empty($searchTerm)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Search term is required'
                ], 400);
            }

            $materials = Material::search($searchTerm)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $materials,
                'message' => 'Search completed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error searching materials: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get materials statistics.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $totalMaterials = Material::count();
            $pendingMaterials = Material::status('pending')->count();
            $approvedMaterials = Material::status('approved')->count();
            $recentMaterials = Material::where('created_at', '>=', now()->subDays(7))->count();

            $statistics = [
                'total' => $totalMaterials,
                'pending' => $pendingMaterials,
                'approved' => $approvedMaterials,
                'recent' => $recentMaterials,
                'completion_rate' => $totalMaterials > 0 ? round(($approvedMaterials / $totalMaterials) * 100, 2) : 0
            ];

            return response()->json([
                'success' => true,
                'data' => $statistics,
                'message' => 'Statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update materials status.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkUpdateStatus(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'material_ids' => 'required|array',
                'material_ids.*' => 'integer|exists:materials,id',
                'status' => 'required|in:pending,approved'
            ]);

            $updatedCount = Material::whereIn('id', $validatedData['material_ids'])
                ->update(['status' => $validatedData['status']]);

            return response()->json([
                'success' => true,
                'data' => ['updated_count' => $updatedCount],
                'message' => "{$updatedCount} materials updated successfully"
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating materials: ' . $e->getMessage()
            ], 500);
        }
    }
}

