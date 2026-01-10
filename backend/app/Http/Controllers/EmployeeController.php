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
   // EmployeeController.php

   public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        // Core Info
        'name' => 'required|string|max:255',
        'position' => 'required|string|max:255',
        'status' => 'required|in:Site,Office',
        'group' => 'nullable|string',
        'id_number' => 'nullable|string',
        
        // Personal
        'age' => 'nullable|integer',
        'birthday' => 'nullable|date',
        'phone_number' => 'nullable|string',
        'address' => 'nullable|string',
        
        // Payroll
        'rate' => 'required|numeric|min:0',
        'date_started' => 'nullable|date',
        'year_started' => 'nullable|integer',
        
        // Gov & Bank
        'sss' => 'nullable|string',
        'philhealth' => 'nullable|string',
        'pagibig' => 'nullable|string',
        'tin' => 'nullable|string',
        'bank_type' => 'nullable|string',
        'bank_account_number' => 'nullable|string',
        'client_name' => 'nullable|string',
        'department_location' => 'nullable|string',
    ]);

    if ($validator->fails()) {
        return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
    }

    try {
        DB::beginTransaction();

        $hourlyRate = (float)$request->rate / 8;

        $employee = \App\Models\Employee::create(array_merge($validator->validated(), [
            'id_number' => $request->id_number,
            'hourly_rate' => $hourlyRate,
        ]));

        DB::commit();
        return response()->json(['success' => true, 'data' => $employee], 201);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
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
        try {
            $exists = DB::table('employees')->where('id', $id)->exists();
            if (!$exists) {
                return response()->json(['success' => false, 'message' => 'Employee not found'], 404);
            }

            $data = $request->except(['id', 'created_at', 'updated_at']);
            $data['updated_at'] = now();

            DB::table('employees')->where('id', $id)->update($data);

            return response()->json(['success' => true, 'message' => 'Employee updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
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
