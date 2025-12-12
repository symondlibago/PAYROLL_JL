<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\OfficePayroll;

class OfficePayrollController extends Controller
{
    public function index()
    {
        // optimized query selecting only needed columns if necessary
        $payrolls = OfficePayroll::orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $payrolls]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'pay_period_start' => 'required|date',
            'pay_period_end' => 'required|date|after_or_equal:pay_period_start',
            'total_working_days' => 'required|numeric|min:0',
            'total_late_minutes' => 'nullable|numeric|min:0',
            'total_overtime_hours' => 'nullable|numeric|min:0',
            'sss_deduction' => 'nullable|numeric|min:0',
            'philhealth_deduction' => 'nullable|numeric|min:0',
            'pagibig_deduction' => 'nullable|numeric|min:0',
            'gbond_deduction' => 'nullable|numeric|min:0',
            'others_deduction' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $employee = DB::table('employees')->where('id', $request->employee_id)->first();

            // Calculate amounts
            $calc = $this->calculatePayrollValues($employee, $request->all());

            $payrollData = array_merge([
                'employee_id' => $employee->id,
                'employee_name' => $employee->name,
                'employee_group' => $employee->group,
                'employee_code' => $employee->employee_id,
                'position' => $employee->position,
                'pay_period_start' => $request->pay_period_start,
                'pay_period_end' => $request->pay_period_end,
                'daily_rate' => $employee->rate,
                'hourly_rate' => $employee->hourly_rate,
                'status' => 'Pending',
                'created_at' => now(),
                'updated_at' => now()
            ], $calc);

            $id = DB::table('office_payrolls')->insertGetId($payrollData);
            $payrollData['id'] = $id;

            return response()->json(['success' => true, 'message' => 'Payroll created', 'data' => $payrollData], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $payroll = OfficePayroll::find($id);
        if (!$payroll) return response()->json(['success' => false, 'message' => 'Not found'], 404);

        try {
            $employee = DB::table('employees')->where('id', $payroll->employee_id)->first();
            
            // Merge existing data with request data to ensure calculations use latest values
            $currentData = $payroll->toArray();
            $mergedData = array_merge($currentData, $request->all());
            
            // Recalculate based on merged data
            $calc = $this->calculatePayrollValues($employee, $mergedData);
            
            // Update fields
            $payroll->update(array_merge($request->all(), $calc));

            return response()->json(['success' => true, 'message' => 'Payroll updated', 'data' => $payroll]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        OfficePayroll::destroy($id);
        return response()->json(['success' => true, 'message' => 'Deleted successfully']);
    }

    /**
     * Centralized Calculation Logic
     */
    private function calculatePayrollValues($employee, $data)
    {
        $dailyRate = $employee->rate;
        $hourlyRate = $employee->hourly_rate;

        $workingDays = $data['total_working_days'] ?? 0;
        $lateMins = $data['total_late_minutes'] ?? 0;
        $otHours = $data['total_overtime_hours'] ?? 0;

        // Deductions Inputs
        $sss = $data['sss_deduction'] ?? 0;
        $philhealth = $data['philhealth_deduction'] ?? 0;
        $pagibig = $data['pagibig_deduction'] ?? 0;
        $gbond = $data['gbond_deduction'] ?? 0;
        $others = $data['others_deduction'] ?? 0;

        // Computations
        $basicSalary = $dailyRate * $workingDays;
        $overtimePay = $hourlyRate * 1.25 * $otHours; // Standard OT is usually 1.25, adjust if needed
        $lateDeduction = ($hourlyRate / 60) * $lateMins;
        
        $grossPay = $basicSalary + $overtimePay;
        $totalDeductions = $lateDeduction + $sss + $philhealth + $pagibig + $gbond + $others;
        $netPay = $grossPay - $totalDeductions;

        return [
            'total_working_days' => $workingDays,
            'total_late_minutes' => $lateMins,
            'total_overtime_hours' => $otHours,
            'basic_salary' => round($basicSalary, 2),
            'overtime_pay' => round($overtimePay, 2),
            'late_deduction' => round($lateDeduction, 2),
            'sss_deduction' => $sss,
            'philhealth_deduction' => $philhealth,
            'pagibig_deduction' => $pagibig,
            'gbond_deduction' => $gbond,
            'others_deduction' => $others,
            'gross_pay' => round($grossPay, 2),
            'total_deductions' => round($totalDeductions, 2),
            'net_pay' => round($netPay, 2)
        ];
    }
}