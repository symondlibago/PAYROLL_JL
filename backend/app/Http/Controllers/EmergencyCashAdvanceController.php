<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\EmergencyCashAdvance;
use App\Models\EmergencyDeduction;

class EmergencyCashAdvanceController extends Controller
{
    /**
     * Display a listing of emergency cash advances.
     */
    public function index()
    {
        try {
            $ecas = DB::table('emergency_cash_advances')
                ->join('employees', 'emergency_cash_advances.employee_id', '=', 'employees.id')
                ->select(
                    'emergency_cash_advances.*',
                    'employees.name as employee_name',
                    'employees.employee_id as employee_code'
                )
                ->orderBy('emergency_cash_advances.created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $ecas
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch emergency cash advances',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created emergency cash advance.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'amount' => 'required|numeric|min:0.01',
            'emergency_deduction' => 'required|numeric|min:0.01'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Check if employee already has an active ECA
            $existingEca = DB::table('emergency_cash_advances')
                ->where('employee_id', $request->employee_id)
                ->where('status', 'active')
                ->first();

            if ($existingEca) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee already has an active emergency cash advance'
                ], 400);
            }

            // Check if employee already has an active ED
            $existingEd = DB::table('emergency_deductions')
                ->where('employee_id', $request->employee_id)
                ->where('status', 'active')
                ->first();

            if ($existingEd) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee already has an active emergency deduction'
                ], 400);
            }

            DB::beginTransaction();

            // Create Emergency Cash Advance
            $ecaData = [
                'employee_id' => $request->employee_id,
                'amount' => $request->amount,
                'remaining_balance' => $request->amount,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now()
            ];

            $ecaId = DB::table('emergency_cash_advances')->insertGetId($ecaData);

            // Create Emergency Deduction
            $edData = [
                'employee_id' => $request->employee_id,
                'amount' => $request->emergency_deduction,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now()
            ];

            $edId = DB::table('emergency_deductions')->insertGetId($edData);

            DB::commit();

            // Get employee details for response
            $employee = DB::table('employees')->where('id', $request->employee_id)->first();

            return response()->json([
                'success' => true,
                'message' => 'Emergency cash advance and deduction created successfully',
                'data' => [
                    'eca' => array_merge($ecaData, ['id' => $ecaId]),
                    'ed' => array_merge($edData, ['id' => $edId]),
                    'employee' => $employee
                ]
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create emergency cash advance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified emergency cash advance.
     */
    public function show($id)
    {
        try {
            $eca = DB::table('emergency_cash_advances')
                ->join('employees', 'emergency_cash_advances.employee_id', '=', 'employees.id')
                ->select(
                    'emergency_cash_advances.*',
                    'employees.name as employee_name',
                    'employees.employee_id as employee_code'
                )
                ->where('emergency_cash_advances.id', $id)
                ->first();

            if (!$eca) {
                return response()->json([
                    'success' => false,
                    'message' => 'Emergency cash advance not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $eca
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch emergency cash advance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get emergency cash advance and deduction for a specific employee.
     */
    public function getByEmployee($employeeId)
    {
        try {
            // Get active ECA
            $eca = DB::table('emergency_cash_advances')
                ->where('employee_id', $employeeId)
                ->where('status', 'active')
                ->first();

            // Get active ED
            $ed = DB::table('emergency_deductions')
                ->where('employee_id', $employeeId)
                ->where('status', 'active')
                ->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'eca' => $eca,
                    'ed' => $ed,
                    'has_active_eca' => $eca !== null,
                    'has_active_ed' => $ed !== null
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch employee ECA/ED data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified emergency cash advance.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'sometimes|required|numeric|min:0.01',
            'remaining_balance' => 'sometimes|required|numeric|min:0',
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
            $eca = DB::table('emergency_cash_advances')->where('id', $id)->first();

            if (!$eca) {
                return response()->json([
                    'success' => false,
                    'message' => 'Emergency cash advance not found'
                ], 404);
            }

            $updateData = array_filter([
                'amount' => $request->amount,
                'remaining_balance' => $request->remaining_balance,
                'status' => $request->status,
                'updated_at' => now()
            ], function($value) {
                return $value !== null;
            });

            DB::table('emergency_cash_advances')->where('id', $id)->update($updateData);

            $updatedEca = DB::table('emergency_cash_advances')->where('id', $id)->first();

            return response()->json([
                'success' => true,
                'message' => 'Emergency cash advance updated successfully',
                'data' => $updatedEca
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update emergency cash advance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified emergency cash advance.
     */
    public function destroy($id)
    {
        try {
            $eca = DB::table('emergency_cash_advances')->where('id', $id)->first();

            if (!$eca) {
                return response()->json([
                    'success' => false,
                    'message' => 'Emergency cash advance not found'
                ], 404);
            }

            DB::beginTransaction();

            // Delete related emergency deduction
            DB::table('emergency_deductions')
                ->where('employee_id', $eca->employee_id)
                ->where('status', 'active')
                ->delete();

            // Delete emergency cash advance
            DB::table('emergency_cash_advances')->where('id', $id)->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Emergency cash advance and related deduction deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete emergency cash advance',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

