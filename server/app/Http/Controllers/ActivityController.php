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

        // 1. Lost Items - Reported by me with status 'lost' and not resolved
        $lostItems = Item::where('user_id', $user->id)
            ->where('valid', 1)
            ->where('status', 'lost')
            ->where('resolution_status', '!=', 'resolved')
            ->with(['user', 'user.info'])
            ->get();

        // 2. Found Items - Reported by me with status 'found' and not resolved
        $foundItems = Item::where('user_id', $user->id)
            ->where('valid', 1)
            ->where('status', 'found')
            ->where('resolution_status', '!=', 'resolved')
            ->with(['user', 'user.info'])
            ->get();

        // 3. Claim Requests - Items others reported that I've claimed (pending claims only - validity = 0)
        $claimRequests = Item::whereHas('claims', function ($query) use ($user) {
            $query->where('claimed_by_id', $user->id)
                  ->where('validity', 0)
                  ->orderByDesc('created_at'); // Newest pending claim first
        })
        ->where('valid', 1)
        ->where('user_id', '!=', $user->id) // Not my items
        ->with(['user', 'user.info', 'claims' => function ($query) use ($user) {
            $query->where('claimed_by_id', $user->id)
                  ->where('validity', 0)
                  ->orderByDesc('created_at')
                  ->with(['claimedBy', 'claimedBy.info']); // Load the claimer user info
        }])
        ->get();

        // Transform to ensure claimedBy is included
        $claimRequests = $claimRequests->map(function ($item) {
            if ($item->claims && $item->claims->count() > 0) {
                $item->claimedByUser = $item->claims->first()->claimedBy;
            }
            return $item;
        })->sortByDesc(function ($item) {
            return optional($item->claims->first())->created_at;
        })->values();

        // 4. Claims Received - Items I reported that others have claimed (pending claims only - validity = 0)
        $claimsReceived = Item::where('user_id', $user->id)
            ->where('valid', 1)
            ->whereHas('claims', function ($query) {
                $query->where('validity', 0)
                      ->orderByDesc('created_at'); // Newest pending claim first
            })
            ->with(['user', 'user.info', 'claims' => function ($query) {
                $query->where('validity', 0)
                      ->orderByDesc('created_at')
                      ->with(['claimedBy', 'claimedBy.info']); // Load the claimer user info
            }])
            ->get();

        // Transform to ensure claimedBy is included
        $claimsReceived = $claimsReceived->map(function ($item) {
            if ($item->claims && $item->claims->count() > 0) {
                $item->claimedByUser = $item->claims->first()->claimedBy;
            }
            return $item;
        })->sortByDesc(function ($item) {
            return optional($item->claims->first())->created_at;
        })->values();

        // 5. Resolved - Items reported by me that are resolved AND items I claimed that were accepted
        $myResolvedItems = Item::where('user_id', $user->id)
            ->where('valid', 1)
            ->where('resolution_status', 'resolved')
            ->with(['user', 'user.info', 'claims' => function ($query) {
                $query->where('validity', '!=', -1)
                      ->orderByDesc('created_at')
                      ->with(['claimedBy', 'claimedBy.info']); // Load the claimer user info
            }])
            ->get();

        // Transform to ensure claimedBy is included for my resolved items
        $myResolvedItems = $myResolvedItems->map(function ($item) {
            if ($item->claims && $item->claims->count() > 0) {
                $item->claimedByUser = $item->claims->first()->claimedBy;
            }
            return $item;
        })->sortByDesc(function ($item) {
            return optional($item->claims->first())->created_at;
        })->values();

        // Items I claimed that were accepted
        $myAcceptedClaimsItems = Item::whereHas('claims', function ($query) use ($user) {
            $query->where('claimed_by_id', $user->id)
                  ->where('validity', 1)
                  ->orderByDesc('created_at'); // Newest accepted claim first
        })
        ->where('valid', 1)
        ->where('user_id', '!=', $user->id) // Not my items
        ->with(['user', 'user.info', 'claims' => function ($query) use ($user) {
            $query->where('claimed_by_id', $user->id)
                  ->where('validity', 1)
                  ->orderByDesc('created_at')
                  ->with(['claimedBy', 'claimedBy.info']); // Load the claimer user info
        }])
        ->get();

        // Transform to ensure claimedBy is included for accepted claims
        $myAcceptedClaimsItems = $myAcceptedClaimsItems->map(function ($item) {
            if ($item->claims && $item->claims->count() > 0) {
                $item->claimedByUser = $item->claims->first()->claimedBy;
            }
            return $item;
        })->sortByDesc(function ($item) {
            return optional($item->claims->first())->created_at;
        })->values();

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
