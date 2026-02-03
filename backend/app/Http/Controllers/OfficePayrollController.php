<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\OfficePayroll;

class OfficePayrollController extends Controller
{
    // ... index, store, update, destroy methods remain standard ...
    
    // (Ensure you copy the full file content, but I will highlight the changed methods below)

    public function index()
    {
        $payrolls = OfficePayroll::orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $payrolls]);
    }

    public function store(Request $request)
    {
        $validator = $this->getValidator($request);
        if ($validator->fails()) return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

        try {
            $employee = DB::table('employees')->where('id', $request->employee_id)->first();
            $calc = $this->calculatePayrollValues($employee, $request->all());

            $payrollData = array_merge([
                'employee_id' => $employee->id,
                'employee_name' => $employee->name,
                'employee_group' => $employee->group,
                'employee_code' => $employee->id_number ?? '',
                'position' => $employee->position,
                'status' => 'Pending',
                'mode_of_payment' => $request->mode_of_payment,
                'allowance_remarks' => $request->allowance_remarks,
                'others_deduction_remarks' => $request->others_deduction_remarks,
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
            $currentData = $payroll->toArray();
            $mergedData = array_merge($currentData, $request->all());
            $calc = $this->calculatePayrollValues($employee, $mergedData);
            
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

    private function getValidator($request) {
        return Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'pay_period_start' => 'required|date',
            'pay_period_end' => 'required|date|after_or_equal:pay_period_start',
            
            // New Earnings
            'ecola' => 'nullable|numeric|min:0',
            'adjustment_1' => 'nullable|numeric',
            'adjustment_2' => 'nullable|numeric',

            'mode_of_payment' => 'nullable|string',
            
            'total_days_worked' => 'required|numeric|min:0',
            'total_hours_worked' => 'nullable|numeric|min:0',
            'total_late_minutes' => 'nullable|numeric|min:0',

            // Holidays
            'sunday_rest_day_days' => 'nullable|numeric|min:0',
            'sunday_rest_day_hours' => 'nullable|numeric|min:0',
            'special_day_days' => 'nullable|numeric|min:0',
            'special_day_hours' => 'nullable|numeric|min:0',
            'special_day_rest_day_days' => 'nullable|numeric|min:0',
            'special_day_rest_day_hours' => 'nullable|numeric|min:0',
            'regular_holiday_days' => 'nullable|numeric|min:0',
            'regular_holiday_hours' => 'nullable|numeric|min:0',
            'regular_holiday_rest_day_days' => 'nullable|numeric|min:0',
            'regular_holiday_rest_day_hours' => 'nullable|numeric|min:0',
            
            // Night Diff (New Days Added)
            'nd_ordinary_days' => 'nullable|numeric|min:0',
            'nd_ordinary_hours' => 'nullable|numeric|min:0',
            'nd_rest_special_days' => 'nullable|numeric|min:0',
            'nd_rest_special_hours' => 'nullable|numeric|min:0',
            'nd_regular_holiday_days' => 'nullable|numeric|min:0',
            'nd_regular_holiday_hours' => 'nullable|numeric|min:0',

            // OT
            'ot_regular_hours' => 'nullable|numeric|min:0',
            'ot_rest_day_hours' => 'nullable|numeric|min:0',
            'ot_special_day_hours' => 'nullable|numeric|min:0',
            'ot_special_rest_day_hours' => 'nullable|numeric|min:0',
            'ot_regular_holiday_hours' => 'nullable|numeric|min:0',

            'allowance_amount' => 'nullable|numeric|min:0',
            'sss_deduction' => 'nullable|numeric|min:0',
            'philhealth_deduction' => 'nullable|numeric|min:0',
            'pagibig_deduction' => 'nullable|numeric|min:0',
        ]);
    }

    private function calculatePayrollValues($employee, $data)
    {
        $dailyRate = floatval($employee->rate);
        $hourlyRate = floatval($employee->hourly_rate);

        // 1. Basic Attendance
        $daysWorked = floatval($data['total_days_worked'] ?? 0);
        $hoursWorked = floatval($data['total_hours_worked'] ?? 0);
        $basicSalary = ($dailyRate * $daysWorked) + ($hourlyRate * $hoursWorked);

        // 2. Late Deduction
        $lateMins = floatval($data['total_late_minutes'] ?? 0);
        $lateDeduction = ($hourlyRate / 60) * $lateMins;

        $calc = function($dVal, $hVal, $mult) use ($dailyRate, $hourlyRate) {
            return (floatval($dVal) * $dailyRate * $mult) + (floatval($hVal) * $hourlyRate * $mult);
        };

        // 3. Holidays
        $holidayPay = 0;
        $holidayPay += $calc($data['sunday_rest_day_days'] ?? 0, $data['sunday_rest_day_hours'] ?? 0, 1.30);
        $holidayPay += $calc($data['special_day_days'] ?? 0, $data['special_day_hours'] ?? 0, 1.30);
        $holidayPay += $calc($data['special_day_rest_day_days'] ?? 0, $data['special_day_rest_day_hours'] ?? 0, 1.50);
        $holidayPay += $calc($data['regular_holiday_days'] ?? 0, $data['regular_holiday_hours'] ?? 0, 2.00);
        $holidayPay += $calc($data['regular_holiday_rest_day_days'] ?? 0, $data['regular_holiday_rest_day_hours'] ?? 0, 2.60);

        // 4. Night Differential
        $nightDiffPay = 0;
        $nightDiffPay += $calc($data['nd_ordinary_days'] ?? 0, $data['nd_ordinary_hours'] ?? 0, 1.10);
        $nightDiffPay += $calc($data['nd_rest_special_days'] ?? 0, $data['nd_rest_special_hours'] ?? 0, 1.43);
        $nightDiffPay += $calc($data['nd_regular_holiday_days'] ?? 0, $data['nd_regular_holiday_hours'] ?? 0, 2.20);

        // 5. Overtime
        $otPay = 0;
        $otPay += floatval($data['ot_regular_hours'] ?? 0) * $hourlyRate * 1.25;
        $otPay += floatval($data['ot_rest_day_hours'] ?? 0) * $hourlyRate * 1.69;
        $otPay += floatval($data['ot_special_day_hours'] ?? 0) * $hourlyRate * 1.69;
        $otPay += floatval($data['ot_special_rest_day_hours'] ?? 0) * $hourlyRate * 1.95;
        $otPay += floatval($data['ot_regular_holiday_hours'] ?? 0) * $hourlyRate * 2.60;

        // 6. Allowance & New Earnings
        $allowance = floatval($data['allowance_amount'] ?? 0);
        $ecola = floatval($data['ecola'] ?? 0);
        $adj1 = floatval($data['adjustment_1'] ?? 0);
        $adj2 = floatval($data['adjustment_2'] ?? 0);

        // GROSS (Now includes Ecola and Adjustments)
        $grossPay = $basicSalary + $holidayPay + $nightDiffPay + $otPay + $allowance + $ecola + $adj1 + $adj2;

        // 7. Deductions
        $sss = floatval($data['sss_deduction'] ?? 0);
        $philhealth = floatval($data['philhealth_deduction'] ?? 0);
        $pagibig = floatval($data['pagibig_deduction'] ?? 0);

        // Employer Shares Calculation (Requested Logic)
        $sssER = $sss * 2;
        $philhealthER = $philhealth * 1; 
        $pagibigER = $pagibig * 1; 

        $deductions = [
            'sss' => floatval($data['sss_deduction'] ?? 0),
            'philhealth' => floatval($data['philhealth_deduction'] ?? 0),
            'pagibig' => floatval($data['pagibig_deduction'] ?? 0),
            'proc_fee' => floatval($data['proc_fee_deduction'] ?? 0),
            'gbond' => floatval($data['gbond_deduction'] ?? 0),
            'uniform' => floatval($data['uniform_deduction'] ?? 0),
            'sss_loan' => floatval($data['sss_loan_deduction'] ?? 0),
            'pagibig_loan' => floatval($data['pagibig_loan_deduction'] ?? 0),
            'sss_calamity' => floatval($data['sss_calamity_loan_deduction'] ?? 0),
            'pagibig_calamity' => floatval($data['pagibig_calamity_loan_deduction'] ?? 0),
            'others' => floatval($data['others_deduction'] ?? 0),
        ];

        $totalDeductions = $lateDeduction + array_sum($deductions);
        $netPay = $grossPay - $totalDeductions;

        return [
            // Basic Inputs
            'pay_period_start' => $data['pay_period_start'],
            'pay_period_end' => $data['pay_period_end'],
            'daily_rate' => $dailyRate,
            'hourly_rate' => $hourlyRate,
            'total_days_worked' => $daysWorked,
            'total_hours_worked' => $hoursWorked,
            'total_late_minutes' => $lateMins,
            'ecola' => $ecola,
            'adjustment_1' => $adj1,
            'adjustment_2' => $adj2,

            // Holidays
            'sunday_rest_day_days' => floatval($data['sunday_rest_day_days'] ?? 0),
            'sunday_rest_day_hours' => floatval($data['sunday_rest_day_hours'] ?? 0),
            'special_day_days' => floatval($data['special_day_days'] ?? 0),
            'special_day_hours' => floatval($data['special_day_hours'] ?? 0),
            'special_day_rest_day_days' => floatval($data['special_day_rest_day_days'] ?? 0),
            'special_day_rest_day_hours' => floatval($data['special_day_rest_day_hours'] ?? 0),
            'regular_holiday_days' => floatval($data['regular_holiday_days'] ?? 0),
            'regular_holiday_hours' => floatval($data['regular_holiday_hours'] ?? 0),
            'regular_holiday_rest_day_days' => floatval($data['regular_holiday_rest_day_days'] ?? 0),
            'regular_holiday_rest_day_hours' => floatval($data['regular_holiday_rest_day_hours'] ?? 0),

            // ND (New)
            'nd_ordinary_days' => floatval($data['nd_ordinary_days'] ?? 0),
            'nd_ordinary_hours' => floatval($data['nd_ordinary_hours'] ?? 0),
            'nd_rest_special_days' => floatval($data['nd_rest_special_days'] ?? 0),
            'nd_rest_special_hours' => floatval($data['nd_rest_special_hours'] ?? 0),
            'nd_regular_holiday_days' => floatval($data['nd_regular_holiday_days'] ?? 0),
            'nd_regular_holiday_hours' => floatval($data['nd_regular_holiday_hours'] ?? 0),

            // OT
            'ot_regular_hours' => floatval($data['ot_regular_hours'] ?? 0),
            'ot_rest_day_hours' => floatval($data['ot_rest_day_hours'] ?? 0),
            'ot_special_day_hours' => floatval($data['ot_special_day_hours'] ?? 0),
            'ot_special_rest_day_hours' => floatval($data['ot_special_rest_day_hours'] ?? 0),
            'ot_regular_holiday_hours' => floatval($data['ot_regular_holiday_hours'] ?? 0),

            // Results
            'basic_salary' => round($basicSalary, 2),
            'holiday_pay' => round($holidayPay, 2),
            'night_diff_pay' => round($nightDiffPay, 2),
            'overtime_pay' => round($otPay, 2),
            'allowance_amount' => round($allowance, 2),
            'gross_pay' => round($grossPay, 2),
                        
            // Deductions & Shares
            'late_deduction' => round($lateDeduction, 2),
            'sss_deduction' => $deductions['sss'],
            'philhealth_deduction' => $deductions['philhealth'],
            'pagibig_deduction' => $deductions['pagibig'],
            
            // Employer Shares
            'sss_employer_share' => round($sssER, 2),
            'philhealth_employer_share' => round($philhealthER, 2),
            'pagibig_employer_share' => round($pagibigER, 2),

            'proc_fee_deduction' => $deductions['proc_fee'],
            'gbond_deduction' => $deductions['gbond'],
            'uniform_deduction' => $deductions['uniform'],
            'sss_loan_deduction' => $deductions['sss_loan'],
            'pagibig_loan_deduction' => $deductions['pagibig_loan'],
            'sss_calamity_loan_deduction' => $deductions['sss_calamity'],
            'pagibig_calamity_loan_deduction' => $deductions['pagibig_calamity'],
            'others_deduction' => $deductions['others'],
            'total_deductions' => round($totalDeductions, 2),
            'net_pay' => round($netPay, 2)
        ];
    }
}