<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    /**
     * Display a listing of tasks.
     */
    public function index()
    {
        try {
            $tasks = DB::table('tasks')
                ->orderBy('created_at', 'desc')
                ->get();

            // Get assigned employees for each task
            foreach ($tasks as $task) {
                if ($task->assigned_employee_ids) {
                    $employeeIds = json_decode($task->assigned_employee_ids, true);
                    if ($employeeIds && is_array($employeeIds)) {
                        $employees = DB::table('employees')
                            ->whereIn('id', $employeeIds)
                            ->select('id', 'name', 'employee_id')
                            ->get();
                        $task->assigned_employees = $employees;
                    } else {
                        $task->assigned_employees = [];
                    }
                } else {
                    $task->assigned_employees = [];
                }

                // Get comment count for each task
                $commentCount = DB::table('task_comments')
                    ->where('task_id', $task->id)
                    ->count();
                $task->comments_count = $commentCount;
            }

            return response()->json([
                'success' => true,
                'data' => $tasks
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch tasks',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created task in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'assigned_employee_ids' => 'required|array|min:1',
            'assigned_employee_ids.*' => 'integer|exists:employees,id',
            'date' => 'required|date',
            'location' => 'required|string|max:255',
            'status' => 'required|in:Pending,In Progress,Completed,Scheduled,Overdue',
            'priority' => 'required|in:Low,Medium,High,Critical',
            'category' => 'required|string|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $task = [
                'name' => $request->name,
                'description' => $request->description,
                'assigned_employee_ids' => json_encode($request->assigned_employee_ids),
                'date' => $request->date,
                'location' => $request->location,
                'status' => $request->status,
                'priority' => $request->priority,
                'category' => $request->category,
                'created_at' => now(),
                'updated_at' => now()
            ];

            $insertedId = DB::table('tasks')->insertGetId($task);
            $task['id'] = $insertedId;

            // Get assigned employees
            $employees = DB::table('employees')
                ->whereIn('id', $request->assigned_employee_ids)
                ->select('id', 'name', 'employee_id')
                ->get();
            $task['assigned_employees'] = $employees;

            return response()->json([
                'success' => true,
                'message' => 'Task created successfully',
                'data' => $task
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create task',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified task.
     */
    public function show($id)
    {
        try {
            $task = DB::table('tasks')->where('id', $id)->first();

            if (!$task) {
                return response()->json([
                    'success' => false,
                    'message' => 'Task not found'
                ], 404);
            }

            // Get assigned employees
            if ($task->assigned_employee_ids) {
                $employeeIds = json_decode($task->assigned_employee_ids, true);
                if ($employeeIds && is_array($employeeIds)) {
                    $employees = DB::table('employees')
                        ->whereIn('id', $employeeIds)
                        ->select('id', 'name', 'employee_id')
                        ->get();
                    $task->assigned_employees = $employees;
                } else {
                    $task->assigned_employees = [];
                }
            } else {
                $task->assigned_employees = [];
            }

            // Get comment count
            $commentCount = DB::table('task_comments')
                ->where('task_id', $task->id)
                ->count();
            $task->comments_count = $commentCount;

            return response()->json([
                'success' => true,
                'data' => $task
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch task',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified task in storage.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'assigned_employee_ids' => 'required|array|min:1',
            'assigned_employee_ids.*' => 'integer|exists:employees,id',
            'date' => 'required|date',
            'location' => 'required|string|max:255',
            'status' => 'required|in:Pending,In Progress,Completed,Scheduled,Overdue',
            'priority' => 'required|in:Low,Medium,High,Critical',
            'category' => 'required|string|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $task = DB::table('tasks')->where('id', $id)->first();

            if (!$task) {
                return response()->json([
                    'success' => false,
                    'message' => 'Task not found'
                ], 404);
            }

            $updateData = [
                'name' => $request->name,
                'description' => $request->description,
                'assigned_employee_ids' => json_encode($request->assigned_employee_ids),
                'date' => $request->date,
                'location' => $request->location,
                'status' => $request->status,
                'priority' => $request->priority,
                'category' => $request->category,
                'updated_at' => now()
            ];

            DB::table('tasks')->where('id', $id)->update($updateData);

            $updatedTask = DB::table('tasks')->where('id', $id)->first();

            // Get assigned employees
            $employees = DB::table('employees')
                ->whereIn('id', $request->assigned_employee_ids)
                ->select('id', 'name', 'employee_id')
                ->get();
            $updatedTask->assigned_employees = $employees;

            return response()->json([
                'success' => true,
                'message' => 'Task updated successfully',
                'data' => $updatedTask
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update task',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified task from storage.
     */
    public function destroy($id)
    {
        try {
            $task = DB::table('tasks')->where('id', $id)->first();

            if (!$task) {
                return response()->json([
                    'success' => false,
                    'message' => 'Task not found'
                ], 404);
            }

            DB::table('tasks')->where('id', $id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Task deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete task',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

