<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ExpenseController extends Controller
{
    /**
     * Validation rules for expenses.
     */
    private function validationRules(bool $isUpdate = false): array
    {
        return [
            'date' => ($isUpdate ? 'sometimes|' : '') . 'nullable|date',
            'or_si_no' => 'nullable|string|max:255',
            'description' => ($isUpdate ? 'sometimes|' : '') . 'required|string',
            'location' => 'nullable|string|max:255',
            'store' => 'nullable|string|max:255',
            'quantity' => 'nullable|string|max:255',
            'size_dimension' => 'nullable|string|max:255',
            'unit_price' => 'nullable|numeric|min:0',
            'total_price' => ($isUpdate ? 'sometimes|' : '') . 'required|numeric|min:0',
            'mop' => 'nullable|string|max:255',
            'mop_description' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif',
        ];
    }

    /**
     * Handle image uploads and return structured data.
     */
    private function processImages($images): array
    {
        $data = [];
        foreach ($images as $image) {
            $content = file_get_contents($image->getRealPath());
            $data[] = [
                'data'          => base64_encode($content),
                'mime_type'     => $image->getMimeType(),
                'original_name' => $image->getClientOriginalName(),
                'size'          => strlen($content)
            ];
        }
        return $data;
    }

    /**
     * Return a JSON error response.
     */
    private function errorResponse(string $message, \Throwable $e, int $status = 500)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'error'   => $e->getMessage()
        ], $status);
    }

    /**
     * Get all expenses
     */
    public function index(): JsonResponse
    {
        try {
            $expenses = Expense::orderBy('created_at', 'desc')->get();
            return response()->json([
                'success' => true,
                'data' => $expenses
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to fetch expenses', $e);
        }
    }

    /**
     * Store a new expense
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), $this->validationRules());
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $imageData = $request->hasFile('images') 
                ? $this->processImages($request->file('images'))
                : [];

            $expense = Expense::create([
                'date' => $request->date,
                'or_si_no' => $request->or_si_no,
                'description' => $request->description,
                'location' => $request->location,
                'store' => $request->store,
                'quantity' => $request->quantity,
                'size_dimension' => $request->size_dimension,
                'unit_price' => $request->unit_price,
                'total_price' => $request->total_price,
                'mop' => $request->mop,
                'mop_description' => $request->mop_description,
                'category' => $request->category,
                'images' => json_encode($imageData),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Expense created successfully',
                'data' => $expense
            ], 201);

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to create expense', $e);
        }
    }

    /**
     * Show a specific expense
     */
    public function show($id): JsonResponse
    {
        try {
            $expense = Expense::find($id);

            if (!$expense) {
                return response()->json([
                    'success' => false,
                    'message' => 'Expense not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $expense
            ]);

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to fetch expense', $e);
        }
    }

    /**
     * Update an expense
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), $this->validationRules(true));
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $expense = Expense::find($id);

            if (!$expense) {
                return response()->json([
                    'success' => false,
                    'message' => 'Expense not found'
                ], 404);
            }

            // Handle images - only update if new images are uploaded
            $imageData = null;
            if ($request->hasFile('images')) {
                // New images uploaded, replace existing ones
                $imageData = $this->processImages($request->file('images'));
            } else {
                // No new images, keep existing ones
                $imageData = is_string($expense->images) ? json_decode($expense->images, true) : $expense->images;
            }

            // Prepare update data - only include fields that are provided
            $updateData = [];
            
            if ($request->has('date')) {
                $updateData['date'] = $request->date;
            }
            
            if ($request->has('or_si_no')) {
                $updateData['or_si_no'] = $request->or_si_no;
            }
            
            if ($request->has('description')) {
                $updateData['description'] = $request->description;
            }
            
            if ($request->has('location')) {
                $updateData['location'] = $request->location;
            }
            
            if ($request->has('store')) {
                $updateData['store'] = $request->store;
            }
            
            if ($request->has('quantity')) {
                $updateData['quantity'] = $request->quantity;
            }
            
            if ($request->has('size_dimension')) {
                $updateData['size_dimension'] = $request->size_dimension;
            }
            
            if ($request->has('unit_price')) {
                $updateData['unit_price'] = $request->unit_price;
            }
            
            if ($request->has('total_price')) {
                $updateData['total_price'] = $request->total_price;
            }
            
            if ($request->has('mop')) {
                $updateData['mop'] = $request->mop;
            }
            
            if ($request->has('mop_description')) {
                $updateData['mop_description'] = $request->mop_description;
            }
            
            if ($request->has('category')) {
                $updateData['category'] = $request->category;
            }
            
            // Always update images (either new ones or existing ones)
            $updateData['images'] = json_encode($imageData);

            $expense->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Expense updated successfully',
                'data' => $expense->fresh()
            ]);

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to update expense', $e);
        }
    }

    /**
     * Delete an expense
     */
    public function destroy($id): JsonResponse
    {
        try {
            $expense = Expense::find($id);

            if (!$expense) {
                return response()->json([
                    'success' => false,
                    'message' => 'Expense not found'
                ], 404);
            }

            // No need to delete files from storage since images are stored in database
            $expense->delete();

            return response()->json([
                'success' => true,
                'message' => 'Expense deleted successfully'
            ]);

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to delete expense', $e);
        }
    }

    /**
     * Serve an image from the database
     */
    public function getImage($id, $imageIndex)
    {
        try {
            $expense = Expense::find($id);

            if (!$expense) {
                return response()->json([
                    'success' => false,
                    'message' => 'Expense not found'
                ], 404);
            }

            $images = is_string($expense->images) ? json_decode($expense->images, true) : $expense->images;
            
            if (!is_array($images) || !isset($images[$imageIndex])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Image not found'
                ], 404);
            }

            $image = $images[$imageIndex];
            
            if (!isset($image['data']) || !isset($image['mime_type'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid image data'
                ], 404);
            }

            $imageData = base64_decode($image['data']);
            
            return response($imageData)
                ->header('Content-Type', $image['mime_type'])
                ->header('Content-Length', strlen($imageData))
                ->header('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve image',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get expenses by category
     */
    public function getByCategory($category): JsonResponse
    {
        try {
            $expenses = Expense::where('category', $category)
                              ->orderBy('created_at', 'desc')
                              ->get();

            return response()->json([
                'success' => true,
                'data' => $expenses
            ]);

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to fetch expenses by category', $e);
        }
    }

    /**
     * Search expenses
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q', '');

            if (empty($query)) {
                $expenses = Expense::orderBy('created_at', 'desc')->get();
            } else {
                $expenses = Expense::where('description', 'LIKE', '%' . $query . '%')
                                  ->orWhere('location', 'LIKE', '%' . $query . '%')
                                  ->orWhere('store', 'LIKE', '%' . $query . '%')
                                  ->orWhere('category', 'LIKE', '%' . $query . '%')
                                  ->orWhere('or_si_no', 'LIKE', '%' . $query . '%')
                                  ->orderBy('created_at', 'desc')
                                  ->get();
            }

            return response()->json([
                'success' => true,
                'data' => $expenses
            ]);

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to search expenses', $e);
        }
    }
}

