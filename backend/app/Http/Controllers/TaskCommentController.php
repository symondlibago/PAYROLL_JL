<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TaskCommentController extends Controller
{
    /**
     * Display a listing of comments for a specific task.
     */
    public function index($taskId)
    {
        try {
            // Check if task exists
            $task = DB::table('tasks')->where('id', $taskId)->first();
            if (!$task) {
                return response()->json([
                    'success' => false,
                    'message' => 'Task not found'
                ], 404);
            }

            // Get comments with nested replies
            $comments = DB::table('task_comments')
                ->where('task_id', $taskId)
                ->whereNull('parent_id')
                ->orderBy('created_at', 'desc')
                ->get();

            // Get replies for each comment
            foreach ($comments as $comment) {
                $replies = DB::table('task_comments')
                    ->where('parent_id', $comment->id)
                    ->orderBy('created_at', 'asc')
                    ->get();
                $comment->replies = $replies;
            }

            return response()->json([
                'success' => true,
                'data' => $comments
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch comments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created comment.
     */
    public function store(Request $request, $taskId)
    {
        $validator = Validator::make($request->all(), [
            'author_name' => 'required|string|max:255',
            'comment' => 'required|string|max:2000',
            'parent_id' => 'nullable|integer|exists:task_comments,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Check if task exists
            $task = DB::table('tasks')->where('id', $taskId)->first();
            if (!$task) {
                return response()->json([
                    'success' => false,
                    'message' => 'Task not found'
                ], 404);
            }

            // If parent_id is provided, check if it belongs to the same task
            if ($request->parent_id) {
                $parentComment = DB::table('task_comments')
                    ->where('id', $request->parent_id)
                    ->where('task_id', $taskId)
                    ->first();
                
                if (!$parentComment) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Parent comment not found or does not belong to this task'
                    ], 404);
                }
            }

            $comment = [
                'task_id' => $taskId,
                'author_name' => $request->author_name,
                'comment' => $request->comment,
                'parent_id' => $request->parent_id,
                'created_at' => now(),
                'updated_at' => now()
            ];

            $insertedId = DB::table('task_comments')->insertGetId($comment);
            $comment['id'] = $insertedId;

            return response()->json([
                'success' => true,
                'message' => 'Comment added successfully',
                'data' => $comment
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create comment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified comment.
     */
    public function update(Request $request, $taskId, $commentId)
    {
        $validator = Validator::make($request->all(), [
            'comment' => 'required|string|max:2000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $comment = DB::table('task_comments')
                ->where('id', $commentId)
                ->where('task_id', $taskId)
                ->first();

            if (!$comment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Comment not found'
                ], 404);
            }

            DB::table('task_comments')
                ->where('id', $commentId)
                ->update([
                    'comment' => $request->comment,
                    'updated_at' => now()
                ]);

            $updatedComment = DB::table('task_comments')->where('id', $commentId)->first();

            return response()->json([
                'success' => true,
                'message' => 'Comment updated successfully',
                'data' => $updatedComment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update comment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified comment.
     */
    public function destroy($taskId, $commentId)
    {
        try {
            $comment = DB::table('task_comments')
                ->where('id', $commentId)
                ->where('task_id', $taskId)
                ->first();

            if (!$comment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Comment not found'
                ], 404);
            }

            // Delete the comment and its replies (cascade delete)
            DB::table('task_comments')->where('id', $commentId)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Comment deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete comment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get comment count for a specific task.
     */
    public function getCommentCount($taskId)
    {
        try {
            $count = DB::table('task_comments')
                ->where('task_id', $taskId)
                ->count();

            return response()->json([
                'success' => true,
                'data' => ['count' => $count]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get comment count',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

