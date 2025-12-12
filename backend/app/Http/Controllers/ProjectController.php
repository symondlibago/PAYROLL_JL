<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use App\Models\Project;

class ProjectController extends Controller
{
    /**
     * Display a listing of the projects.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $projects = Project::orderBy('created_at', 'desc')->get();
            
            return response()->json($projects, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch projects',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created project in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'project_name' => 'required|string|max:255',
                'project_location' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $project = Project::create([
                'project_name' => $request->project_name,
                'project_location' => $request->project_location,
            ]);

            return response()->json([
                'message' => 'Project created successfully',
                'project' => $project
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create project',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified project.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show($id): JsonResponse
    {
        try {
            $project = Project::findOrFail($id);
            
            return response()->json($project, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Project not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified project in storage.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $project = Project::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'project_name' => 'required|string|max:255',
                'project_location' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $project->update([
                'project_name' => $request->project_name,
                'project_location' => $request->project_location,
            ]);

            return response()->json([
                'message' => 'Project updated successfully',
                'project' => $project
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update project',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified project from storage.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy($id): JsonResponse
    {
        try {
            $project = Project::findOrFail($id);
            $project->delete();

            return response()->json([
                'message' => 'Project deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete project',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

