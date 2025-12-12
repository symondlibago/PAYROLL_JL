<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use App\Models\DailyUpdate;
use App\Models\Project;

class DailyUpdateController extends Controller
{
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
     * Display a listing of daily updates for a specific project.
     *
     * @param int $projectId
     * @return JsonResponse
     */
    public function index($projectId): JsonResponse
    {
        try {
            $project = Project::findOrFail($projectId);
            $dailyUpdates = DailyUpdate::where('project_id', $projectId)
                ->orderBy('date', 'desc')
                ->get();
            
            return response()->json($dailyUpdates, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch daily updates',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created daily update in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'project_id' => 'required|exists:projects,id',
                'date' => 'required|date',
                'weather' => 'nullable|string|max:255',
                'manpower' => 'nullable|integer|min:0',
                'activity' => 'required|string',
                'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif', // No size limit for database storage
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Handle image uploads
            $imageData = $request->hasFile('images') 
                ? $this->processImages($request->file('images'))
                : [];

            $dailyUpdate = DailyUpdate::create([
                'project_id' => $request->project_id,
                'date' => $request->date,
                'weather' => $request->weather,
                'manpower' => $request->manpower,
                'activity' => $request->activity,
                'images' => json_encode($imageData),
            ]);

            return response()->json([
                'message' => 'Daily update created successfully',
                'daily_update' => $dailyUpdate
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create daily update',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified daily update.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show($id): JsonResponse
    {
        try {
            $dailyUpdate = DailyUpdate::with('project')->findOrFail($id);
            
            return response()->json($dailyUpdate, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Daily update not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified daily update in storage.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $dailyUpdate = DailyUpdate::findOrFail($id);

            // Get all request data including files
            $requestData = $request->all();
            
            // Handle the _method field for PUT requests via FormData
            if (isset($requestData['_method'])) {
                unset($requestData['_method']);
            }

            $validator = Validator::make($requestData, [
                'date' => 'required|date',
                'weather' => 'nullable|string|max:255',
                'manpower' => 'nullable|integer|min:0',
                'activity' => 'required|string',
                'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif', // No size limit for database storage
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Handle images - only update if new images are uploaded
            $imageData = null;
            if ($request->hasFile('images')) {
                // New images uploaded, replace existing ones
                $imageData = $this->processImages($request->file('images'));
            } else {
                // No new images, keep existing ones
                $imageData = is_string($dailyUpdate->images) ? json_decode($dailyUpdate->images, true) : $dailyUpdate->images;
            }

            // Prepare update data
            $updateData = [
                'date' => $request->date,
                'activity' => $request->activity,
                'images' => json_encode($imageData),
            ];

            // Only include optional fields if they are provided
            if ($request->has('weather')) {
                $updateData['weather'] = $request->weather;
            }

            if ($request->has('manpower') && $request->manpower !== '') {
                $updateData['manpower'] = $request->manpower;
            }

            $dailyUpdate->update($updateData);

            return response()->json([
                'message' => 'Daily update updated successfully',
                'daily_update' => $dailyUpdate->fresh()
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update daily update',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified daily update from storage.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy($id): JsonResponse
    {
        try {
            $dailyUpdate = DailyUpdate::findOrFail($id);
            
            // No need to delete files from storage since images are stored in database
            $dailyUpdate->delete();

            return response()->json([
                'message' => 'Daily update deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete daily update',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

