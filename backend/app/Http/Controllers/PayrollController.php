<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PayrollController extends Controller
{
    /**
     * Get employees by status (Site or Office)
     */
    public function getEmployeesByStatus($status)
    {
        try {
            $employees = DB::table('employees')
                ->where('status', $status)
                ->select('id', 'employee_id', 'name', 'position', 'rate', 'hourly_rate')
                ->orderBy('name', 'asc')
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
     * Get ECA and ED data for a specific employee
     */
    public function getEmployeeEcaEd($employeeId)
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
                    'has_active_ed' => $ed !== null,
                    'auto_cash_advance' => $ed ? $ed->amount : 0,
                    'is_readonly' => $eca !== null && $eca->remaining_balance > 0
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
     * Store a new payroll record
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'payroll_type' => 'required|in:Site,Office',
            'pay_period_start' => 'required|date',
            'pay_period_end' => 'required|date|after_or_equal:pay_period_start',
            'working_days' => 'required|integer|min:0|max:7',
            'overtime_hours' => 'required|numeric|min:0',
            'late_minutes' => 'required|numeric|min:0',
            'cash_advance' => 'required|numeric|min:0',
            'others_deduction' => 'required|numeric|min:0',
            'emergency_cash_advance' => 'nullable|numeric|min:0',
            'emergency_deduction' => 'nullable|numeric|min:0',
            'daily_attendance' => 'nullable|array',
            'daily_attendance.monday' => 'nullable|boolean',
            'daily_attendance.tuesday' => 'nullable|boolean',
            'daily_attendance.wednesday' => 'nullable|boolean',
            'daily_attendance.thursday' => 'nullable|boolean',
            'daily_attendance.friday' => 'nullable|boolean',
            'daily_attendance.saturday' => 'nullable|boolean',
            'daily_overtime' => 'nullable|array',
            'daily_overtime.monday' => 'nullable|numeric|min:0',
            'daily_overtime.tuesday' => 'nullable|numeric|min:0',
            'daily_overtime.wednesday' => 'nullable|numeric|min:0',
            'daily_overtime.thursday' => 'nullable|numeric|min:0',
            'daily_overtime.friday' => 'nullable|numeric|min:0',
            'daily_overtime.saturday' => 'nullable|numeric|min:0',
            'daily_late' => 'nullable|array',
            'daily_late.monday' => 'nullable|numeric|min:0',
            'daily_late.tuesday' => 'nullable|numeric|min:0',
            'daily_late.wednesday' => 'nullable|numeric|min:0',
            'daily_late.thursday' => 'nullable|numeric|min:0',
            'daily_late.friday' => 'nullable|numeric|min:0',
            'daily_late.saturday' => 'nullable|numeric|min:0',
            'daily_site_address' => 'nullable|array',
            'daily_site_address.monday' => 'nullable|string',
            'daily_site_address.tuesday' => 'nullable|string',
            'daily_site_address.wednesday' => 'nullable|string',
            'daily_site_address.thursday' => 'nullable|string',
            'daily_site_address.friday' => 'nullable|string',
            'daily_site_address.saturday' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Get employee details
            $employee = DB::table('employees')->where('id', $request->employee_id)->first();
            
            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee not found'
                ], 404);
            }

            // Check for existing active ECA and ED
            $existingEca = DB::table('emergency_cash_advances')
                ->where('employee_id', $request->employee_id)
                ->where('status', 'active')
                ->first();

            $existingEd = DB::table('emergency_deductions')
                ->where('employee_id', $request->employee_id)
                ->where('status', 'active')
                ->first();

            // Handle new ECA and ED creation if provided
            if ($request->emergency_cash_advance && $request->emergency_deduction) {
                if ($existingEca) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Employee already has an active emergency cash advance'
                    ], 400);
                }

                // Create new ECA
                $ecaData = [
                    'employee_id' => $request->employee_id,
                    'amount' => $request->emergency_cash_advance,
                    'remaining_balance' => $request->emergency_cash_advance,
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now()
                ];
                DB::table('emergency_cash_advances')->insert($ecaData);

                // Create new ED
                $edData = [
                    'employee_id' => $request->employee_id,
                    'amount' => $request->emergency_deduction,
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now()
                ];
                DB::table('emergency_deductions')->insert($edData);

                $existingEca = (object) $ecaData;
                $existingEd = (object) $edData;
            }

            // Process ECA deduction if exists
            if ($existingEca && $existingEd && $request->cash_advance > 0) {
                $newBalance = $existingEca->remaining_balance - $request->cash_advance;
                
                if ($newBalance <= 0) {
                    // Mark ECA and ED as completed
                    DB::table('emergency_cash_advances')
                        ->where('employee_id', $request->employee_id)
                        ->where('status', 'active')
                        ->update([
                            'status' => 'completed',
                            'remaining_balance' => 0,
                            'updated_at' => now()
                        ]);

                    DB::table('emergency_deductions')
                        ->where('employee_id', $request->employee_id)
                        ->where('status', 'active')
                        ->update([
                            'status' => 'completed',
                            'updated_at' => now()
                        ]);
                } else {
                    // Update remaining balance
                    DB::table('emergency_cash_advances')
                        ->where('employee_id', $request->employee_id)
                        ->where('status', 'active')
                        ->update([
                            'remaining_balance' => $newBalance,
                            'updated_at' => now()
                        ]);
                }
            }

            // Process daily attendance data
            $dailyAttendance = $this->processDailyAttendance($request->input('daily_attendance', []));
            $dailyOvertime = $this->processDailyOvertime($request->input('daily_overtime', []));
            $dailyLate = $this->processDailyLate($request->input('daily_late', []));
            $dailySiteAddress = $this->processDailySiteAddress($request->input('daily_site_address', []));

            // Calculate payroll with daily data
            $calculations = $this->calculatePayrollWithDaily($employee, $request->all(), $dailyAttendance, $dailyOvertime, $dailyLate);

            $payrollData = [
                'employee_id' => $request->employee_id,
                'employee_name' => $employee->name,
                'employee_group' => $employee->group,
                'employee_code' => $employee->employee_id,
                'position' => $employee->position,
                'payroll_type' => $request->payroll_type,
                'pay_period_start' => $request->pay_period_start,
                'pay_period_end' => $request->pay_period_end,
                'daily_rate' => $employee->rate,
                'hourly_rate' => $employee->hourly_rate,
                'working_days' => $request->working_days,
                'overtime_hours' => $request->overtime_hours,
                'late_minutes' => $request->late_minutes,
                'daily_attendance' => json_encode($dailyAttendance),
                'daily_overtime' => json_encode($dailyOvertime),
                'daily_late' => json_encode($dailyLate),
                'daily_site_address' => json_encode($dailySiteAddress),
                'basic_salary' => $calculations['basic_salary'],
                'overtime_pay' => $calculations['overtime_pay'],
                'late_deduction' => $calculations['late_deduction'],
                'cash_advance' => $request->cash_advance,
                'others_deduction' => $request->others_deduction,
                'gross_pay' => $calculations['gross_pay'],
                'total_deductions' => $calculations['total_deductions'],
                'net_pay' => $calculations['net_pay'],
                'status' => 'Pending',
                'created_at' => now(),
                'updated_at' => now()
            ];

            $payrollId = DB::table('payrolls')->insertGetId($payrollData);
            $payrollData['id'] = $payrollId;

            DB::commit();

            // Decode JSON for response
            $payrollData['daily_attendance'] = $dailyAttendance;
            $payrollData['daily_overtime'] = $dailyOvertime;
            $payrollData['daily_late'] = $dailyLate;
            $payrollData['daily_site_address'] = $dailySiteAddress;

            return response()->json([
                'success' => true,
                'message' => 'Payroll processed successfully',
                'data' => $payrollData
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to process payroll',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all payroll records
     */
    public function index()
    {
        try {
            $payrolls = DB::table('payrolls')
                ->orderBy('created_at', 'desc')
                ->get();

            // Decode JSON fields for each payroll
            $payrolls = $payrolls->map(function ($payroll) {
                $payroll->daily_attendance = json_decode($payroll->daily_attendance, true);
                $payroll->daily_overtime = json_decode($payroll->daily_overtime, true);
                $payroll->daily_late = json_decode($payroll->daily_late, true);
                $payroll->daily_site_address = json_decode($payroll->daily_site_address, true);
                return $payroll;
            });

            return response()->json([
                'success' => true,
                'data' => $payrolls
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payroll records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific payroll record
     */
    public function show($id)
    {
        try {
            $payroll = DB::table('payrolls')->where('id', $id)->first();

            if (!$payroll) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payroll record not found'
                ], 404);
            }

            // Decode JSON fields
            $payroll->daily_attendance = json_decode($payroll->daily_attendance, true);
            $payroll->daily_overtime = json_decode($payroll->daily_overtime, true);
            $payroll->daily_late = json_decode($payroll->daily_late, true);
            $payroll->daily_site_address = json_decode($payroll->daily_site_address, true);

            return response()->json([
                'success' => true,
                'data' => $payroll
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payroll record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a payroll record - Enhanced to support all fields
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'nullable|in:Pending,Processing,Paid,On Hold',
            'pay_period_start' => 'nullable|date',
            'pay_period_end' => 'nullable|date|after_or_equal:pay_period_start',
            'working_days' => 'nullable|integer|min:0|max:7',
            'overtime_hours' => 'nullable|numeric|min:0',
            'late_minutes' => 'nullable|numeric|min:0',
            'cash_advance' => 'nullable|numeric|min:0',
            'others_deduction' => 'nullable|numeric|min:0',
            'daily_attendance' => 'nullable|array',
            'daily_attendance.monday' => 'nullable|boolean',
            'daily_attendance.tuesday' => 'nullable|boolean',
            'daily_attendance.wednesday' => 'nullable|boolean',
            'daily_attendance.thursday' => 'nullable|boolean',
            'daily_attendance.friday' => 'nullable|boolean',
            'daily_attendance.saturday' => 'nullable|boolean',
            'daily_overtime' => 'nullable|array',
            'daily_overtime.monday' => 'nullable|numeric|min:0',
            'daily_overtime.tuesday' => 'nullable|numeric|min:0',
            'daily_overtime.wednesday' => 'nullable|numeric|min:0',
            'daily_overtime.thursday' => 'nullable|numeric|min:0',
            'daily_overtime.friday' => 'nullable|numeric|min:0',
            'daily_overtime.saturday' => 'nullable|numeric|min:0',
            'daily_late' => 'nullable|array',
            'daily_late.monday' => 'nullable|numeric|min:0',
            'daily_late.tuesday' => 'nullable|numeric|min:0',
            'daily_late.wednesday' => 'nullable|numeric|min:0',
            'daily_late.thursday' => 'nullable|numeric|min:0',
            'daily_late.friday' => 'nullable|numeric|min:0',
            'daily_late.saturday' => 'nullable|numeric|min:0',
            'daily_site_address' => 'nullable|array',
            'daily_site_address.monday' => 'nullable|string',
            'daily_site_address.tuesday' => 'nullable|string',
            'daily_site_address.wednesday' => 'nullable|string',
            'daily_site_address.thursday' => 'nullable|string',
            'daily_site_address.friday' => 'nullable|string',
            'daily_site_address.saturday' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $payroll = DB::table('payrolls')->where('id', $id)->first();

            if (!$payroll) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payroll record not found'
                ], 404);
            }

            // Get employee details for recalculation
            $employee = DB::table('employees')->where('id', $payroll->employee_id)->first();

            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee not found'
                ], 404);
            }

            // Prepare update data
            $updateData = ['updated_at' => now()];
            
            // Update basic fields
            if ($request->has('status')) {
                $updateData['status'] = $request->status;
            }
            
            if ($request->has('pay_period_start')) {
                $updateData['pay_period_start'] = $request->pay_period_start;
            }
            
            if ($request->has('pay_period_end')) {
                $updateData['pay_period_end'] = $request->pay_period_end;
            }

            // Check if any calculation-affecting fields are being updated
            $needsRecalculation = false;
            $calculationData = [
                'working_days' => $payroll->working_days,
                'overtime_hours' => $payroll->overtime_hours,
                'late_minutes' => $payroll->late_minutes,
                'cash_advance' => $payroll->cash_advance,
                'others_deduction' => $payroll->others_deduction
            ];

            // Handle daily data updates
            $dailyAttendance = json_decode($payroll->daily_attendance, true) ?: [];
            $dailyOvertime = json_decode($payroll->daily_overtime, true) ?: [];
            $dailyLate = json_decode($payroll->daily_late, true) ?: [];
            $dailySiteAddress = json_decode($payroll->daily_site_address, true) ?: [];

            if ($request->has('daily_attendance')) {
                $dailyAttendance = $this->processDailyAttendance($request->daily_attendance);
                $updateData['daily_attendance'] = json_encode($dailyAttendance);
                
                // Recalculate working days from daily attendance
                $workingDaysCount = array_sum(array_values($dailyAttendance));
                $updateData['working_days'] = $workingDaysCount;
                $calculationData['working_days'] = $workingDaysCount;
                $needsRecalculation = true;
            }

            if ($request->has('daily_overtime')) {
                $dailyOvertime = $this->processDailyOvertime($request->daily_overtime);
                $updateData['daily_overtime'] = json_encode($dailyOvertime);
                
                // Recalculate total overtime hours
                $totalOvertimeHours = array_sum(array_values($dailyOvertime));
                $updateData['overtime_hours'] = $totalOvertimeHours;
                $calculationData['overtime_hours'] = $totalOvertimeHours;
                $needsRecalculation = true;
            }

            if ($request->has('daily_late')) {
                $dailyLate = $this->processDailyLate($request->daily_late);
                $updateData['daily_late'] = json_encode($dailyLate);
                
                // Recalculate total late minutes
                $totalLateMinutes = array_sum(array_values($dailyLate));
                $updateData['late_minutes'] = $totalLateMinutes;
                $calculationData['late_minutes'] = $totalLateMinutes;
                $needsRecalculation = true;
            }

            if ($request->has('daily_site_address')) {
                $dailySiteAddress = $this->processDailySiteAddress($request->daily_site_address);
                $updateData['daily_site_address'] = json_encode($dailySiteAddress);
            }

            // Handle direct field updates
            if ($request->has('working_days')) {
                $updateData['working_days'] = $request->working_days;
                $calculationData['working_days'] = $request->working_days;
                $needsRecalculation = true;
            }
            
            if ($request->has('overtime_hours')) {
                $updateData['overtime_hours'] = $request->overtime_hours;
                $calculationData['overtime_hours'] = $request->overtime_hours;
                $needsRecalculation = true;
            }
            
            if ($request->has('late_minutes')) {
                $updateData['late_minutes'] = $request->late_minutes;
                $calculationData['late_minutes'] = $request->late_minutes;
                $needsRecalculation = true;
            }
            
            if ($request->has('cash_advance')) {
                $updateData['cash_advance'] = $request->cash_advance;
                $calculationData['cash_advance'] = $request->cash_advance;
                $needsRecalculation = true;
            }
            
            if ($request->has('others_deduction')) {
                $updateData['others_deduction'] = $request->others_deduction;
                $calculationData['others_deduction'] = $request->others_deduction;
                $needsRecalculation = true;
            }

            // Recalculate if necessary
            if ($needsRecalculation) {
                $calculations = $this->calculatePayrollWithDaily($employee, $calculationData, $dailyAttendance, $dailyOvertime, $dailyLate);
                
                $updateData['basic_salary'] = $calculations['basic_salary'];
                $updateData['overtime_pay'] = $calculations['overtime_pay'];
                $updateData['late_deduction'] = $calculations['late_deduction'];
                $updateData['gross_pay'] = $calculations['gross_pay'];
                $updateData['total_deductions'] = $calculations['total_deductions'];
                $updateData['net_pay'] = $calculations['net_pay'];
            }

            // Handle ECA deduction updates if cash advance changed
            if ($request->has('cash_advance')) {
                $existingEca = DB::table('emergency_cash_advances')
                    ->where('employee_id', $payroll->employee_id)
                    ->where('status', 'active')
                    ->first();

                $existingEd = DB::table('emergency_deductions')
                    ->where('employee_id', $payroll->employee_id)
                    ->where('status', 'active')
                    ->first();

                if ($existingEca && $existingEd) {
                    // Calculate the difference in cash advance
                    $oldCashAdvance = $payroll->cash_advance;
                    $newCashAdvance = $request->cash_advance;
                    $difference = $newCashAdvance - $oldCashAdvance;

                    if ($difference != 0) {
                        $newBalance = $existingEca->remaining_balance - $difference;
                        
                        if ($newBalance <= 0) {
                            // Mark ECA and ED as completed
                            DB::table('emergency_cash_advances')
                                ->where('employee_id', $payroll->employee_id)
                                ->where('status', 'active')
                                ->update([
                                    'status' => 'completed',
                                    'remaining_balance' => 0,
                                    'updated_at' => now()
                                ]);

                            DB::table('emergency_deductions')
                                ->where('employee_id', $payroll->employee_id)
                                ->where('status', 'active')
                                ->update([
                                    'status' => 'completed',
                                    'updated_at' => now()
                                ]);
                        } else {
                            // Update remaining balance
                            DB::table('emergency_cash_advances')
                                ->where('employee_id', $payroll->employee_id)
                                ->where('status', 'active')
                                ->update([
                                    'remaining_balance' => max(0, $newBalance),
                                    'updated_at' => now()
                                ]);
                        }
                    }
                }
            }

            DB::table('payrolls')->where('id', $id)->update($updateData);

            $updatedPayroll = DB::table('payrolls')->where('id', $id)->first();

            // Decode JSON fields for response
            $updatedPayroll->daily_attendance = json_decode($updatedPayroll->daily_attendance, true);
            $updatedPayroll->daily_overtime = json_decode($updatedPayroll->daily_overtime, true);
            $updatedPayroll->daily_late = json_decode($updatedPayroll->daily_late, true);
            $updatedPayroll->daily_site_address = json_decode($updatedPayroll->daily_site_address, true);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payroll record updated successfully',
                'data' => $updatedPayroll
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update payroll record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a payroll record
     */
    public function destroy($id)
    {
        try {
            $payroll = DB::table('payrolls')->where('id', $id)->first();

            if (!$payroll) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payroll record not found'
                ], 404);
            }

            DB::table('payrolls')->where('id', $id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Payroll record deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete payroll record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update payroll status
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:Pending,Processing,Paid,On Hold'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $payroll = DB::table('payrolls')->where('id', $id)->first();

            if (!$payroll) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payroll record not found'
                ], 404);
            }

            DB::table('payrolls')->where('id', $id)->update([
                'status' => $request->status,
                'updated_at' => now()
            ]);

            $updatedPayroll = DB::table('payrolls')->where('id', $id)->first();

            // Decode JSON fields
            $updatedPayroll->daily_attendance = json_decode($updatedPayroll->daily_attendance, true);
            $updatedPayroll->daily_overtime = json_decode($updatedPayroll->daily_overtime, true);
            $updatedPayroll->daily_late = json_decode($updatedPayroll->daily_late, true);
            $updatedPayroll->daily_site_address = json_decode($updatedPayroll->daily_site_address, true);

            return response()->json([
                'success' => true,
                'message' => 'Payroll status updated successfully',
                'data' => $updatedPayroll
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update payroll status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process daily attendance data
     */
    private function processDailyAttendance($dailyAttendance)
    {
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        $processed = [];
        
        foreach ($days as $day) {
            $processed[$day] = isset($dailyAttendance[$day]) ? (bool) $dailyAttendance[$day] : false;
        }
        
        return $processed;
    }

    /**
     * Process daily overtime data
     */
    private function processDailyOvertime($dailyOvertime)
    {
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        $processed = [];
        
        foreach ($days as $day) {
            $processed[$day] = isset($dailyOvertime[$day]) ? (float) $dailyOvertime[$day] : 0;
        }
        
        return $processed;
    }

    /**
     * Process daily late data
     */
    private function processDailyLate($dailyLate)
    {
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        $processed = [];
        
        foreach ($days as $day) {
            $processed[$day] = isset($dailyLate[$day]) ? (float) $dailyLate[$day] : 0;
        }
        
        return $processed;
    }

    /**
     * Process daily site address data
     */
    private function processDailySiteAddress($dailySiteAddress)
    {
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        $processed = [];
        
        foreach ($days as $day) {
            $processed[$day] = isset($dailySiteAddress[$day]) ? (string) $dailySiteAddress[$day] : '';
        }
        
        return $processed;
    }

    /**
     * Calculate payroll amounts with daily data
     */
    private function calculatePayrollWithDaily($employee, $data, $dailyAttendance, $dailyOvertime, $dailyLate)
    {
        $dailyRate = $employee->rate;
        $hourlyRate = $employee->hourly_rate;
        
        // Calculate from daily data if available, otherwise use totals
        $workingDays = isset($data['working_days']) ? $data['working_days'] : array_sum(array_values($dailyAttendance));
        $totalOvertimeHours = isset($data['overtime_hours']) ? $data['overtime_hours'] : array_sum(array_values($dailyOvertime));
        $totalLateMinutes = isset($data['late_minutes']) ? $data['late_minutes'] : array_sum(array_values($dailyLate));
        
        $cashAdvance = $data['cash_advance'];
        $othersDeduction = $data['others_deduction'];

        // Calculate basic salary (daily rate * working days)
        $basicSalary = $dailyRate * $workingDays;

        // Calculate overtime pay (hourly rate * 1.25 * overtime hours)
        $overtimePay = $hourlyRate * 1 * $totalOvertimeHours;

        // Calculate late deduction (hourly rate / 60 * late minutes)
        $lateDeduction = ($hourlyRate / 60) * $totalLateMinutes;

        // Calculate gross pay
        $grossPay = $basicSalary + $overtimePay;

        // Calculate total deductions
        $totalDeductions = $lateDeduction + $cashAdvance + $othersDeduction;

        // Calculate net pay
        $netPay = $grossPay - $totalDeductions;

        return [
            'basic_salary' => round($basicSalary, 2),
            'overtime_pay' => round($overtimePay, 2),
            'late_deduction' => round($lateDeduction, 2),
            'gross_pay' => round($grossPay, 2),
            'total_deductions' => round($totalDeductions, 2),
            'net_pay' => round($netPay, 2)
        ];
    }
}

