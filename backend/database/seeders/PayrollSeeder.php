<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;
use Carbon\Carbon;

class PayrollSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('en_PH'); // Use Philippines locale

        // 1. Create Employees
        $positions = ['Software Engineer', 'HR Officer', 'Accountant', 'Admin Assistant', 'Project Manager'];
        $departments = ['IT Dept', 'Human Resources', 'Finance', 'Admin', 'Operations'];
        $banks = ['AUB', 'EAST WEST', 'Cash', 'Palawan'];
        $clients = ['Pizza Hut', 'Dairy Queen', 'Taco Bell', 'Internal'];

        $employeeIds = [];

        foreach (range(1, 15) as $index) {
            // FIX: Define Monthly Rate as a fixed salary (e.g., 15k - 40k)
            $monthlyRate = $faker->randomElement([15000, 18000, 20000, 25000, 30000, 35000]);
            
            // Keep Daily/Hourly independent or derived as you prefer. 
            // Here I'll generate them reasonably but independently as per your previous code.
            $dailyRate = $faker->randomFloat(2, 600, 2000); 
            $hourlyRate = round($dailyRate / 8, 2);
            
            $id = DB::table('employees')->insertGetId([
                'id_number' => 'EMP-' . str_pad($index, 3, '0', STR_PAD_LEFT),
                'name' => $faker->name,
                'position' => $faker->randomElement($positions),
                'age' => $faker->numberBetween(22, 50),
                'birthday' => $faker->date('Y-m-d', '-20 years'),
                'phone_number' => $faker->phoneNumber,
                'address' => $faker->address,
                'group' => 'Group ' . $faker->randomElement(['A', 'B', 'C']),
                'date_started' => $faker->date('Y-m-d', '-2 years'),
                'year_started' => $faker->year,
                'status' => 'Office', 
                
                'rate' => $dailyRate,
                'monthly_rate' => $monthlyRate, // <--- Now properly defined as a fixed value
                'hourly_rate' => $hourlyRate,
                
                // Gov & Bank
                'sss' => $faker->numerify('##-#######-#'),
                'philhealth' => $faker->numerify('##-#########-#'),
                'pagibig' => $faker->numerify('####-####-####'),
                'tin' => $faker->numerify('###-###-###-000'),
                'client_name' => $faker->randomElement($clients),
                'department_location' => $faker->randomElement($departments),
                'bank_account_number' => $faker->bankAccountNumber,
                'bank_type' => $faker->randomElement($banks),
                
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $employeeIds[] = $id;
        }

        // 2. Create Payrolls for these Employees
        $periods = [
            ['start' => '2024-01-01', 'end' => '2024-01-15'],
            ['start' => '2024-01-16', 'end' => '2024-01-31'],
        ];

        foreach ($employeeIds as $empId) {
            $employee = DB::table('employees')->where('id', $empId)->first();

            foreach ($periods as $period) {
                // Generate Attendance
                $daysWorked = $faker->randomFloat(1, 10, 13); 
                $hoursWorked = 0; 
                $lateMins = $faker->numberBetween(0, 120);
                
                // Rates
                $daily = $employee->rate;
                $hourly = $employee->hourly_rate;

                // --- Earnings Calculation ---
                $basicSalary = round($daysWorked * $daily, 2);
                
                // Random Overtime
                $otRegularHours = $faker->numberBetween(0, 5);
                $otPay = round($otRegularHours * $hourly * 1.25, 2);

                // Random Holiday 
                $regHolDays = $faker->randomElement([0, 0, 0, 1]); 
                $holidayPay = round($regHolDays * $daily * 2.0, 2); 

                $allowance = $faker->randomElement([0, 500, 1000, 2000]);
                
                $grossPay = $basicSalary + $otPay + $holidayPay + $allowance;

                // --- Deductions Calculation ---
                $lateDeduction = round(($hourly / 60) * $lateMins, 2);
                
                // Govt 
                $sss = 500.00;
                $philhealth = 300.00;
                $pagibig = 100.00;
                
                // Loans 
                $sssLoan = $faker->randomElement([0, 0, 250]);
                $pagibigLoan = $faker->randomElement([0, 0, 150]);
                
                $totalDeductions = $lateDeduction + $sss + $philhealth + $pagibig + $sssLoan + $pagibigLoan;
                
                $netPay = round($grossPay - $totalDeductions, 2);

                DB::table('office_payrolls')->insert([
                    'employee_id' => $employee->id,
                    'employee_name' => $employee->name,
                    'employee_group' => $employee->group,
                    'position' => $employee->position,
                    
                    'pay_period_start' => $period['start'],
                    'pay_period_end' => $period['end'],
                    'mode_of_payment' => $employee->bank_type,

                    'daily_rate' => $daily,
                    // 'monthly_rate' => $employee->monthly_rate, // Uncomment if you added this column to office_payrolls
                    'hourly_rate' => $hourly,
                    
                    // Attendance
                    'total_days_worked' => $daysWorked,
                    'total_hours_worked' => 0,
                    'total_late_minutes' => $lateMins,

                    // Holidays (Days & Hours)
                    'regular_holiday_days' => $regHolDays,
                    'regular_holiday_hours' => 0,

                    // OT
                    'ot_regular_hours' => $otRegularHours,

                    // Money Values
                    'basic_salary' => $basicSalary,
                    'holiday_pay' => $holidayPay,
                    'night_diff_pay' => 0,
                    'overtime_pay' => $otPay,
                    'allowance_amount' => $allowance,
                    'allowance_remarks' => $allowance > 0 ? 'Rice Subsidy' : null,
                    'gross_pay' => $grossPay,

                    // Deductions
                    'late_deduction' => $lateDeduction,
                    'sss_deduction' => $sss,
                    'philhealth_deduction' => $philhealth,
                    'pagibig_deduction' => $pagibig,
                    'sss_loan_deduction' => $sssLoan,
                    'pagibig_loan_deduction' => $pagibigLoan,
                    'total_deductions' => $totalDeductions,
                    
                    'net_pay' => $netPay,
                    
                    'status' => $faker->randomElement(['Pending', 'Processing', 'Released', 'Paid']),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}