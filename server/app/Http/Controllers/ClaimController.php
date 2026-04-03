<?php

namespace App\Http\Controllers;

use App\Models\Claim;
use App\Models\Item;
use Illuminate\Http\Request;

class ClaimController extends Controller
{
    public function acceptClaim(Request $request, $claimId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $claim = Claim::find($claimId);
        if (!$claim) {
            return response()->json(['message' => 'Claim not found'], 404);
        }

        $item = Item::find($claim->item_id);
        if (!$item) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        // Only item owner can accept/decline claims
        if ($item->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Update claim validity to 1 (accepted)
        $claim->validity = 1;
        $claim->save();

        // Update item resolution_status to resolved
        $item->resolution_status = 'resolved';
        $item->save();

        return response()->json([
            'message' => 'Claim accepted successfully',
            'claim' => $claim,
            'item_status' => $item->resolution_status
        ], 200);
    }

    public function declineClaim(Request $request, $claimId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $claim = Claim::find($claimId);
        if (!$claim) {
            return response()->json(['message' => 'Claim not found'], 404);
        }

        $item = Item::find($claim->item_id);
        if (!$item) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        // Only item owner can accept/decline claims
        if ($item->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Update claim validity to -1 (declined)
        $claim->validity = -1;
        $claim->save();

        // Check if there are any other active claims
        $activeClaims = Claim::where('item_id', $item->id)
            ->where('validity', '!=', -1)
            ->exists();

        // If no more active claims, set resolution_status back to not_claimed
        if (!$activeClaims) {
            $item->resolution_status = 'not_claimed';
            $item->save();
        }

        return response()->json([
            'message' => 'Claim declined successfully',
            'claim' => $claim,
            'item_status' => $item->resolution_status
        ], 200);
    }
}
