<?php

namespace App\Http\Controllers;

use App\Models\RFIQuery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RFIQueryController extends Controller
{
    /**
     * Validation rules for RFI queries.
     */
    private function validationRules(bool $isUpdate = false): array
    {
        return [
            'description' => 'required|string|max:1000',
            'date'        => 'required|date',
            'status'      => ($isUpdate ? 'required' : 'nullable') . '|in:pending,approved,reject',
            'images'      => 'nullable|array|max:10',
            'images.*'    => 'image|mimes:jpeg,png,jpg,gif', // No size limit
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

    public function index()
    {
        try {
            $queries = RFIQuery::latest()->get();
            return response()->json(['success' => true, 'data' => $queries]);
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to fetch RFI queries', $e);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), $this->validationRules());
            if ($validator->fails()) {
                return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
            }

            $imageData = $request->hasFile('images') 
                ? $this->processImages($request->file('images'))
                : [];

            $query = RFIQuery::create([
                'description' => $request->description,
                'date'        => $request->date,
                'status'      => $request->status ?? 'pending',
                'images'      => json_encode($imageData),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'RFI query created successfully',
                'data'    => $query
            ], 201);
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to create RFI query', $e);
        }
    }

    public function show(string $id)
    {
        try {
            $query = RFIQuery::find($id);
            if (!$query) {
                return response()->json(['success' => false, 'message' => 'RFI query not found'], 404);
            }
            return response()->json(['success' => true, 'data' => $query]);
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to fetch RFI query', $e);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $validator = Validator::make($request->all(), $this->validationRules(true));
            if ($validator->fails()) {
                return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
            }

            $query = RFIQuery::find($id);
            if (!$query) {
                return response()->json(['success' => false, 'message' => 'RFI query not found'], 404);
            }

            $imageData = $request->hasFile('images')
                ? $this->processImages($request->file('images'))
                : (is_string($query->images) ? json_decode($query->images, true) : $query->images);

            $query->update([
                'description' => $request->description,
                'date'        => $request->date,
                'status'      => $request->status,
                'images'      => json_encode($imageData),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'RFI query updated successfully',
                'data'    => $query->fresh()
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to update RFI query', $e);
        }
    }

    public function destroy(string $id)
    {
        try {
            $query = RFIQuery::find($id);
            if (!$query) {
                return response()->json(['success' => false, 'message' => 'RFI query not found'], 404);
            }
            $query->delete();
            return response()->json(['success' => true, 'message' => 'RFI query deleted successfully']);
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to delete RFI query', $e);
        }
    }

    public function updateStatus(Request $request, string $id)
    {
        try {
            $validator = Validator::make($request->all(), ['status' => 'required|in:pending,approved,reject']);
            if ($validator->fails()) {
                return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
            }

            $query = RFIQuery::find($id);
            if (!$query) {
                return response()->json(['success' => false, 'message' => 'RFI query not found'], 404);
            }

            $query->update(['status' => $request->status]);

            return response()->json([
                'success' => true,
                'message' => 'RFI query status updated successfully',
                'data'    => $query->fresh()
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to update RFI query status', $e);
        }
    }

    public function getByStatus(string $status)
    {
        try {
            $queries = RFIQuery::where('status', $status)->latest()->get();
            return response()->json(['success' => true, 'data' => $queries]);
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to fetch RFI queries by status', $e);
        }
    }

    public function search(Request $request)
    {
        try {
            $queryStr = $request->get('q', '');
            $queries = RFIQuery::when($queryStr, fn($q) =>
                $q->where('description', 'LIKE', '%' . $queryStr . '%')
            )->latest()->get();

            return response()->json(['success' => true, 'data' => $queries]);
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to search RFI queries', $e);
        }
    }
}
