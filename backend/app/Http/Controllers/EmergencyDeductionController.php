<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class EmergencyDeductionController extends Controller
{
    /**
     * Display a listing of emergency deductions.
     */
    public function index()
    {
        try {
            $eds = DB::table('emergency_deductions')
                ->join('employees', 'emergency_deductions.employee_id', '=', 'employees.id')
                ->select(
                    'emergency_deductions.*',
                    'employees.name as employee_name',
                    'employees.employee_id as employee_code'
                )
                ->orderBy('emergency_deductions.created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $eds
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch emergency deductions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified emergency deduction.
     */
    public function show($id)
    {
        try {
            $ed = DB::table('emergency_deductions')
                ->join('employees', 'emergency_deductions.employee_id', '=', 'employees.id')
                ->select(
                    'emergency_deductions.*',
                    'employees.name as employee_name',
                    'employees.employee_id as employee_code'
                )
                ->where('emergency_deductions.id', $id)
                ->first();

            if (!$ed) {
                return response()->json([
                    'success' => false,
                    'message' => 'Emergency deduction not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $ed
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch emergency deduction',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified emergency deduction.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'sometimes|required|numeric|min:0.01',
            'status' => 'sometimes|required|in:active,completed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $ed = DB::table('emergency_deductions')->where('id', $id)->first();

            if (!$ed) {
                return response()->json([
                    'success' => false,
                    'message' => 'Emergency deduction not found'
                ], 404);
            }

            $updateData = array_filter([
                'amount' => $request->amount,
                'status' => $request->status,
                'updated_at' => now()
            ], function($value) {
                return $value !== null;
            });

            DB::table('emergency_deductions')->where('id', $id)->update($updateData);

            $updatedEd = DB::table('emergency_deductions')->where('id', $id)->first();

            return response()->json([
                'success' => true,
                'message' => 'Emergency deduction updated successfully',
                'data' => $updatedEd
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update emergency deduction',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified emergency deduction.
     */
    public function destroy($id)
    {
        try {
            $ed = DB::table('emergency_deductions')->where('id', $id)->first();

            if (!$ed) {
                return response()->json([
                    'success' => false,
                    'message' => 'Emergency deduction not found'
                ], 404);
            }

            DB::table('emergency_deductions')->where('id', $id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Emergency deduction deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete emergency deduction',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

