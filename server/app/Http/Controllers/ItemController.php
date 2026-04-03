<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Claim;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ItemController extends Controller
{
    public function index()
    {
        $items = Item::where('valid', 1)
            ->where('resolution_status', 'not_claimed')
            ->with(['user', 'user.info'])
            ->get();
        return response()->json(['items' => $items]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'item_name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'description' => 'required|string',
            'date_time' => 'required|date',
            'location' => 'required|string|max:255',
            'status' => 'required|in:lost,found',
            'contact_info' => 'required|string|max:255',
            'item_image_url' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $validator->errors()], 400);
        }

        // Must be authenticated to report
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $itemData = $request->all();
        $itemData['user_id'] = $user->id;

        // Default values will be handled by DB if not provided, but we can set them explicitly just in case
        $itemData['valid'] = 1;
        $itemData['resolution_status'] = 'not_claimed';

        if (!isset($itemData['item_image_url']) || empty($itemData['item_image_url'])) {
            $itemData['item_image_url'] = 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400';
        }

        $item = Item::create($itemData);

        return response()->json(['message' => 'Item reported successfully', 'item' => $item], 201);
    }

    public function toggleClaim(Request $request, $id)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $item = Item::find($id);
        if (!$item) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        // Cannot claim your own items
        if ($item->user_id === $user->id) {
            return response()->json(['message' => 'Cannot claim your own items'], 403);
        }

        // Check if user already has a claim on this item
        $existingClaim = Claim::where('item_id', $id)
            ->where('claimed_by_id', $user->id)
            ->first();

        if ($existingClaim) {
            // Remove claim
            $existingClaim->delete();

            // Check if there are any other active claims on this item
            $activeClaims = Claim::where('item_id', $id)
                ->where('validity', '!=', -1)
                ->exists();

            // If no more active claims, set resolution_status back to not_claimed
            if (!$activeClaims) {
                $item->resolution_status = 'not_claimed';
                $item->save();
            }

            return response()->json([
                'message' => 'Claim removed successfully',
                'claimed' => false,
                'resolution_status' => $item->resolution_status
            ], 200);
        } else {
            // Create new claim
            Claim::create([
                'item_id' => $id,
                'claimed_by_id' => $user->id,
                'validity' => 0 // pending
            ]);

            // Update item resolution_status to claimed
            $item->resolution_status = 'claimed';
            $item->save();

            return response()->json([
                'message' => 'Item claimed successfully',
                'claimed' => true,
                'resolution_status' => $item->resolution_status
            ], 201);
        }
    }
}

