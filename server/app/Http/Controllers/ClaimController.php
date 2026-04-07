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

        if ($claim->validity !== 0) {
            return response()->json(['message' => 'Only pending claims can be accepted'], 400);
        }

        // Update selected claim validity to 1 (accepted)
        $claim->validity = 1;
        $claim->save();

        // Decline all other pending claims for this same item.
        Claim::where('item_id', $item->id)
            ->where('claim_id', '!=', $claim->claim_id)
            ->where('validity', 0)
            ->update(['validity' => -1]);

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

        if ($claim->validity !== 0) {
            return response()->json(['message' => 'Only pending claims can be declined'], 400);
        }

        // Update selected claim validity to -1 (declined)
        $claim->validity = -1;
        $claim->save();

        // Keep item as claimed while at least one pending claim exists.
        $pendingClaims = Claim::where('item_id', $item->id)
            ->where('validity', 0)
            ->exists();

        // If no pending claims remain, move item back to not_claimed.
        if (!$pendingClaims) {
            $item->resolution_status = 'not_claimed';
            $item->save();
        } else {
            $item->resolution_status = 'claimed';
            $item->save();
        }

        return response()->json([
            'message' => 'Claim declined successfully',
            'claim' => $claim,
            'item_status' => $item->resolution_status
        ], 200);
    }
}
