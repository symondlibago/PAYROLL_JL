<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class EquipmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $equipment = Equipment::orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $equipment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch equipment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'equipment_name' => 'required|string|max:255',
                'equipment_code' => 'required|string|max:255|unique:equipment,equipment_code',
                'brand' => 'required|string|max:255',
                'serial_number' => 'nullable|string|max:255',
                'item_status' => 'required|in:Available,Borrowed,Maintenance,Out of Service',
                'present_location' => 'nullable|string|max:255',
                'borrowed_by' => 'nullable|string|max:255',
                'date_borrowed' => 'nullable|date',
                'status' => 'nullable|in:Excellent,Good,Fair,Poor',
                'expected_return_date' => 'nullable|date',
                'purpose_notes' => 'nullable|string'
            ]);

            $equipment = Equipment::create($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Equipment created successfully',
                'data' => $equipment
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
                'message' => 'Failed to create equipment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $equipment = Equipment::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $equipment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Equipment not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $equipment = Equipment::findOrFail($id);
            
            $validatedData = $request->validate([
                'equipment_name' => 'sometimes|required|string|max:255',
                'equipment_code' => 'sometimes|required|string|max:255|unique:equipment,equipment_code,' . $id,
                'brand' => 'sometimes|required|string|max:255',
                'serial_number' => 'nullable|string|max:255',
                'item_status' => 'sometimes|required|in:Available,Borrowed,Maintenance,Out of Service',
                'present_location' => 'nullable|string|max:255',
                'borrowed_by' => 'nullable|string|max:255',
                'date_borrowed' => 'nullable|date',
                'status' => 'nullable|in:Excellent,Good,Fair,Poor',
                'expected_return_date' => 'nullable|date',
                'purpose_notes' => 'nullable|string'
            ]);

            $equipment->update($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Equipment updated successfully',
                'data' => $equipment
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
                'message' => 'Failed to update equipment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $equipment = Equipment::findOrFail($id);
            $equipment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Equipment deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete equipment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Borrow equipment
     */
    public function borrow(Request $request, string $id): JsonResponse
    {
        try {
            $equipment = Equipment::findOrFail($id);
            
            // Check if equipment is available
            if ($equipment->item_status !== 'Available') {
                return response()->json([
                    'success' => false,
                    'message' => 'Equipment is not available for borrowing'
                ], 400);
            }

            $validatedData = $request->validate([
                'borrowed_by' => 'required|string|max:255',
                'date_borrowed' => 'required|date',
                'expected_return_date' => 'nullable|date',
                'purpose_notes' => 'nullable|string',
                'present_location' => 'required|string|max:255'

            ]);

            $equipment->update([
                'item_status' => 'Borrowed',
                'borrowed_by' => $validatedData['borrowed_by'],
                'date_borrowed' => $validatedData['date_borrowed'],
                'expected_return_date' => $validatedData['expected_return_date'] ?? null,
                'purpose_notes' => $validatedData['purpose_notes'] ?? null,
                'present_location' => $validatedData['present_location']

            ]);

            return response()->json([
                'success' => true,
                'message' => 'Equipment borrowed successfully',
                'data' => $equipment
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
                'message' => 'Failed to borrow equipment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Return equipment
     */
    public function returnEquipment(Request $request, string $id): JsonResponse
    {
        try {
            $equipment = Equipment::findOrFail($id);
            
            // Check if equipment is borrowed
            if ($equipment->item_status !== 'Borrowed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Equipment is not currently borrowed'
                ], 400);
            }

            $equipment->update([
                'item_status' => 'Available',
                'borrowed_by' => null,
                'date_borrowed' => null,
                'expected_return_date' => null,
                'purpose_notes' => null,
                'present_location' => null

            ]);

            return response()->json([
                'success' => true,
                'message' => 'Equipment returned successfully',
                'data' => $equipment
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to return equipment',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

