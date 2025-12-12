<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class EmployeeController extends Controller
{
    /**
     * Display a listing of employees.
     */
    public function index()
    {
        try {
            $employees = DB::table('employees')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $employees
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch employees',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created employee in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'age' => 'required|integer|min:18|max:100',
            'phone_number' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'group' => 'required|string|max:500',
            'year_started' => 'required|integer|min:1900|max:' . date('Y'),
            'status' => 'required|in:Site,Office',
            'rate' => 'required|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Generate employee ID based on status
            $employeeId = $this->generateEmployeeId($request->status);
            
            // Calculate hourly rate (rate / 8 hours)
            $hourlyRate = $request->rate / 8;

            $employee = [
                'employee_id' => $employeeId,
                'name' => $request->name,
                'position' => $request->position,
                'age' => $request->age,
                'phone_number' => $request->phone_number,
                'address' => $request->address,
                'group' => $request->group,
                'year_started' => $request->year_started,
                'status' => $request->status,
                'rate' => $request->rate,
                'hourly_rate' => $hourlyRate,
                'created_at' => now(),
                'updated_at' => now()
            ];

            $insertedId = DB::table('employees')->insertGetId($employee);
            $employee['id'] = $insertedId;

            return response()->json([
                'success' => true,
                'message' => 'Employee added successfully',
                'data' => $employee
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add employee',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified employee.
     */
    public function show($id)
    {
        try {
            $employee = DB::table('employees')->where('id', $id)->first();

            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $employee
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch employee',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified employee in storage.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'age' => 'required|integer|min:18|max:100',
            'phone_number' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'group' => 'required|string|max:500',
            'year_started' => 'required|integer|min:1900|max:' . date('Y'),
            'status' => 'required|in:Site,Office',
            'rate' => 'required|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $employee = DB::table('employees')->where('id', $id)->first();

            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee not found'
                ], 404);
            }

            // Check if status changed and generate new ID if needed
            $employeeId = $employee->employee_id;
            if ($employee->status !== $request->status) {
                $employeeId = $this->generateEmployeeId($request->status);
            }
            
            // Calculate hourly rate (rate / 8 hours)
            $hourlyRate = $request->rate / 8;

            $updateData = [
                'employee_id' => $employeeId,
                'name' => $request->name,
                'position' => $request->position,
                'age' => $request->age,
                'phone_number' => $request->phone_number,
                'address' => $request->address,
                'group' => $request->group,
                'year_started' => $request->year_started,
                'status' => $request->status,
                'rate' => $request->rate,
                'hourly_rate' => $hourlyRate,
                'updated_at' => now()
            ];

            DB::table('employees')->where('id', $id)->update($updateData);

            $updatedEmployee = DB::table('employees')->where('id', $id)->first();

            return response()->json([
                'success' => true,
                'message' => 'Employee updated successfully',
                'data' => $updatedEmployee
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update employee',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified employee from storage.
     */
    public function destroy($id)
    {
        try {
            $employee = DB::table('employees')->where('id', $id)->first();

            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee not found'
                ], 404);
            }

            DB::table('employees')->where('id', $id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Employee deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete employee',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate employee ID based on status
     */
    private function generateEmployeeId($status)
    {
        $prefix = $status === 'Site' ? 'SEMP' : 'OEMP';
        
        // Get the last employee with the same prefix
        $lastEmployee = DB::table('employees')
            ->where('employee_id', 'LIKE', $prefix . '%')
            ->orderBy('employee_id', 'desc')
            ->first();

        if ($lastEmployee) {
            // Extract the number from the last employee ID
            $lastNumber = (int) substr($lastEmployee->employee_id, strlen($prefix));
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        // Format with leading zeros (3 digits)
        return $prefix . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
    }
}
