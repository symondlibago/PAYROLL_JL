<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\OfficePayrollController;
use App\Http\Controllers\EmergencyCashAdvanceController;
use App\Http\Controllers\EmergencyDeductionController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskCommentController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\DailyUpdateController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\RFIQueryController;
use App\Http\Controllers\MaterialController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/


Route::options('{any}', function () {
    return response()->json([], 200);
})->where('any', '.*');


// Public routes
Route::post("/register", [AuthController::class, "register"]);
Route::post("/login", [AuthController::class, "login"]);

// Expense routes (public for now, can be protected later)
Route::apiResource("expenses", ExpenseController::class);
Route::get('/expenses/{id}/image/{imageIndex}', [ExpenseController::class, 'getImage']);

// Vehicle routes (public for now, can be protected later)
Route::apiResource("vehicles", VehicleController::class);
Route::patch("vehicles/{id}/status", [VehicleController::class, "updateStatus"]);
Route::get("vehicles/status/{status}", [VehicleController::class, "getByStatus"]);
Route::get("vehicles/search", [VehicleController::class, "search"]);

// Task routes
Route::apiResource("tasks", TaskController::class);

// Task Comment routes
Route::get("tasks/{taskId}/comments", [TaskCommentController::class, "index"]);
Route::post("tasks/{taskId}/comments", [TaskCommentController::class, "store"]);
Route::put("tasks/{taskId}/comments/{commentId}", [TaskCommentController::class, "update"]);
Route::delete("tasks/{taskId}/comments/{commentId}", [TaskCommentController::class, "destroy"]);
Route::get("tasks/{taskId}/comments/count", [TaskCommentController::class, "getCommentCount"]);

// Project routes (public for now, can be protected later)
Route::apiResource("projects", ProjectController::class);

// Daily Update routes (public for now, can be protected later)
Route::apiResource("daily-updates", DailyUpdateController::class);
Route::get("projects/{projectId}/daily-updates", [DailyUpdateController::class, "index"]);

// Materials routes (public for now, can be protected later)
Route::apiResource("materials", MaterialController::class);
Route::patch("materials/{id}/status", [MaterialController::class, "updateStatus"]);
Route::get("materials/status/{status}", [MaterialController::class, "getByStatus"]);
Route::get("materials/search", [MaterialController::class, "search"]);
Route::get("materials/statistics", [MaterialController::class, "getStatistics"]);
Route::patch("materials/bulk-status", [MaterialController::class, "bulkUpdateStatus"]);

// Protected routes
Route::middleware("auth:sanctum")->group(function () {
    Route::get("/user", [AuthController::class, "user"]);
    Route::post("/logout", [AuthController::class, "logout"]);
});

Route::middleware("api")->group(function () {
    Route::apiResource("equipment", EquipmentController::class);
    Route::patch("equipment/{id}/borrow", [EquipmentController::class, "borrow"]);
    Route::patch("equipment/{id}/return", [EquipmentController::class, "returnEquipment"]);
    
    // Employee routes
    Route::apiResource("employees", EmployeeController::class);
    
    // Site Payroll routes (existing)
    Route::apiResource("payrolls", PayrollController::class);
    Route::get("employees/status/{status}", [PayrollController::class, "getEmployeesByStatus"]);
    Route::patch("payrolls/{id}/status", [PayrollController::class, "updateStatus"]);
    
    // New route for attendance details
    Route::get("payrolls/{id}/attendance", [PayrollController::class, "getAttendanceDetails"]);
    
    // New route for getting employee ECA/ED data
    Route::get("employees/{employeeId}/eca-ed", [PayrollController::class, "getEmployeeEcaEd"]);
    
    // Office Payroll routes (new)
    Route::apiResource("office-payrolls", OfficePayrollController::class);
    Route::patch("office-payrolls/{id}/status", [OfficePayrollController::class, "updateStatus"]);
    
    // Emergency Cash Advance routes
    Route::apiResource("emergency-cash-advances", EmergencyCashAdvanceController::class);
    Route::get("employees/{employeeId}/eca-ed-details", [EmergencyCashAdvanceController::class, "getByEmployee"]);
    
    // Emergency Deduction routes
    Route::apiResource("emergency-deductions", EmergencyDeductionController::class);

    // RFI Query routes
    Route::apiResource("rfi-queries", RFIQueryController::class);
    Route::patch("rfi-queries/{id}/status", [RFIQueryController::class, "updateStatus"]);
    Route::get("rfi-queries/status/{status}", [RFIQueryController::class, "getByStatus"]);
    Route::get("rfi-queries/search", [RFIQueryController::class, "search"]);
});

