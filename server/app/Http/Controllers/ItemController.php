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
            ->where('resolution_status', '!=', 'resolved')
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

        if ($item->resolution_status === 'resolved' || (int) $item->valid !== 1) {
            return response()->json(['message' => 'This item is not claimable'], 400);
        }

        // Check if user already has a pending claim on this item.
        $existingPendingClaim = Claim::where('item_id', $id)
            ->where('claimed_by_id', $user->id)
            ->where('validity', 0)
            ->first();

        if ($existingPendingClaim) {
            // Release claim: mark this claim as declined (-1) instead of deleting row.
            $existingPendingClaim->validity = -1;
            $existingPendingClaim->save();

            // Item remains claimed while there is any other pending claim.
            $hasPendingClaims = Claim::where('item_id', $id)
                ->where('validity', 0)
                ->exists();

            $item->resolution_status = $hasPendingClaims ? 'claimed' : 'not_claimed';
            $item->save();

            return response()->json([
                'message' => 'Claim released successfully',
                'claimed' => false,
                'resolution_status' => $item->resolution_status
            ], 200);
        } else {
            // Re-open previously declined claim if available, otherwise create a new pending claim.
            $existingDeclinedClaim = Claim::where('item_id', $id)
                ->where('claimed_by_id', $user->id)
                ->where('validity', -1)
                ->orderByDesc('claim_id')
                ->first();

            if ($existingDeclinedClaim) {
                $existingDeclinedClaim->validity = 0;
                $existingDeclinedClaim->save();
            } else {
                Claim::create([
                    'item_id' => $id,
                    'claimed_by_id' => $user->id,
                    'validity' => 0 // pending
                ]);
            }

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

    public function update(Request $request, $id)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $item = Item::find($id);
        if (!$item) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        if ((int) $item->user_id !== (int) $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($item->resolution_status === 'resolved' || (int) $item->valid !== 1) {
            return response()->json(['message' => 'Only active unresolved items can be edited'], 400);
        }

        $validator = Validator::make($request->all(), [
            'item_name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'description' => 'required|string',
            'date_time' => 'required|date',
            'location' => 'required|string|max:255',
            'contact_info' => 'required|string|max:255',
            'item_image_url' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $validator->errors()], 400);
        }

        $item->update($validator->validated());

        return response()->json([
            'message' => 'Item updated successfully',
            'item' => $item->fresh(['user', 'user.info'])
        ], 200);
    }

    public function destroy(Request $request, $id)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $item = Item::find($id);
        if (!$item) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        if ((int) $item->user_id !== (int) $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($item->resolution_status === 'resolved') {
            return response()->json(['message' => 'Only unresolved items can be deleted'], 400);
        }

        $item->valid = 0;
        $item->save();

        return response()->json([
            'message' => 'Item deleted successfully'
        ], 200);
    }
}

