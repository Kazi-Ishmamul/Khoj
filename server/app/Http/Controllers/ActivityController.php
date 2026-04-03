<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Claim;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function myActivity(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // 1. Lost Items - Reported by me with status 'lost'
        $lostItems = Item::where('user_id', $user->id)
            ->where('status', 'lost')
            ->get();

        // 2. Found Items - Reported by me with status 'found'
        $foundItems = Item::where('user_id', $user->id)
            ->where('status', 'found')
            ->get();

        // 3. Claim Requests - Items others reported that I've claimed (pending claims only - validity = 0)
        $claimRequests = Item::whereHas('claims', function ($query) use ($user) {
            $query->where('claimed_by_id', $user->id)
                  ->where('validity', 0); // Only pending claims
        })
        ->where('user_id', '!=', $user->id) // Not my items
        ->with(['claims' => function ($query) use ($user) {
            $query->where('claimed_by_id', $user->id)
                  ->where('validity', 0); // Only pending claims
        }])
        ->get();

        // 4. Claims Received - Items I reported that others have claimed (pending claims only - validity = 0)
        $claimsReceived = Item::where('user_id', $user->id)
            ->whereHas('claims', function ($query) {
                $query->where('validity', 0); // Only pending claims
            })
            ->with(['claims' => function ($query) {
                $query->where('validity', 0); // Only pending claims
            }])
            ->get();

        // 5. Resolved - Items reported by me that are resolved AND items I claimed that were accepted
        $myResolvedItems = Item::where('user_id', $user->id)
            ->where('resolution_status', 'resolved')
            ->get();

        // Items I claimed that were accepted
        $myAcceptedClaimsItems = Item::whereHas('claims', function ($query) use ($user) {
            $query->where('claimed_by_id', $user->id)
                  ->where('validity', 1); // Accepted claims
        })
        ->where('user_id', '!=', $user->id) // Not my items
        ->with(['claims' => function ($query) use ($user) {
            $query->where('claimed_by_id', $user->id)
                  ->where('validity', 1); // Accepted claims
        }])
        ->get();

        $resolved = $myResolvedItems->merge($myAcceptedClaimsItems);

        return response()->json([
            'data' => [
                'lost_items' => [
                    'count' => $lostItems->count(),
                    'items' => $lostItems
                ],
                'found_items' => [
                    'count' => $foundItems->count(),
                    'items' => $foundItems
                ],
                'claim_requests' => [
                    'count' => $claimRequests->count(),
                    'items' => $claimRequests
                ],
                'claims_received' => [
                    'count' => $claimsReceived->count(),
                    'items' => $claimsReceived
                ],
                'resolved' => [
                    'count' => $resolved->count(),
                    'items' => $resolved
                ]
            ]
        ], 200);
    }
}
