<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Item;
use App\Models\Claim;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Get all pending reports (Admin only)
     */
    public function index(Request $request)
    {
        try {
            $reports = Report::pending()
                ->with(['item', 'reportedBy', 'item.user'])
                ->orderBy('created_at', 'desc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $reports
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch reports',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get reports for a specific item
     */
    public function getItemReports($itemId)
    {
        try {
            $item = Item::findOrFail($itemId);

            $reports = Report::where('item_id', $itemId)
                ->with(['reportedBy'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $reports
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Item not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * User reports an item
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'item_id' => 'required|exists:items,id',
                'reason' => 'required|string|max:500'
            ]);

            $userId = auth()->id();
            $itemId = $validated['item_id'];

            // Check if user already reported this item and the report is still pending
            $existingReport = Report::where('item_id', $itemId)
                ->where('r_user_id', $userId)
                ->where('status', 0) // 0 = pending
                ->first();

            if ($existingReport) {
                return response()->json([
                    'success' => false,
                    'message' => 'You already have a pending report for this item'
                ], 422);
            }

            $report = Report::create([
                'item_id' => $itemId,
                'r_user_id' => $userId,
                'reason' => $validated['reason'],
                'status' => 0  // Pending
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Item reported successfully',
                'data' => $report->load(['item', 'reportedBy'])
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to report item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin strikes a report - cascading logic
     * When struck:
     * - Report status = -1
     * - Item valid = 0 (soft delete)
     * - Item resolution_status = 'not_claimed'
     * - All other reports on same item = status -1
     * - All claims on that item = validity -1
     */
    public function strike($reportId)
    {
        DB::beginTransaction();

        try {
            $report = Report::findOrFail($reportId);
            $notifications = app(NotificationService::class);

            // Already struck
            if ($report->status === -1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Report already struck'
                ], 422);
            }

            $itemId = $report->item_id;
            $item = Item::findOrFail($itemId);
            $affectedReports = Report::where('item_id', $itemId)->get();

            // 1. Strike the report
            $report->update(['status' => -1]);

            // 2. Soft delete the item
            Item::where('id', $itemId)->update(['valid' => 0]);

            // 3. Reset resolution status
            Item::where('id', $itemId)->update(['resolution_status' => 'not_claimed']);

            // 4. Strike all other reports on this item
            Report::where('item_id', $itemId)
                ->where('report_id', '!=', $reportId)
                ->update(['status' => -1]);

            // 5. Decline all claims on this item
            Claim::where('item_id', $itemId)->update(['validity' => -1]);

            $notifications->notifyUser(
                (int) $item->user_id,
                'item_struck',
                "Your post \"{$item->item_name}\" was struck by an admin after report review.",
                'item',
                (int) $item->id
            );

            foreach ($affectedReports as $affectedReport) {
                $notifications->notifyUser(
                    (int) $affectedReport->r_user_id,
                    'report_struck',
                    "Your report for \"{$item->item_name}\" was struck by an admin.",
                    'report',
                    (int) $affectedReport->report_id
                );
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Report struck successfully. Item soft-deleted and all claims declined.',
                'data' => $report->fresh()->load(['item', 'reportedBy'])
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Report not found'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to strike report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin dismisses a report (report was valid concern)
     * Sets report status = 1
     */
    public function dismiss($reportId)
    {
        try {
            $report = Report::findOrFail($reportId);
            $notifications = app(NotificationService::class);

            if ($report->status !== 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Can only dismiss pending reports'
                ], 422);
            }

            $report->update(['status' => 1]);

            $notifications->notifyUser(
                (int) $report->r_user_id,
                'report_dismissed',
                'Your report was reviewed and dismissed by an admin.',
                'report',
                (int) $report->report_id
            );

            return response()->json([
                'success' => true,
                'message' => 'Report dismissed',
                'data' => $report->fresh()->load(['item', 'reportedBy'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to dismiss report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics about reports
     */
    public function getStats()
    {
        try {
            $stats = [
                'total_reports' => Report::count(),
                'pending_reports' => Report::pending()->count(),
                'struck_reports' => Report::struck()->distinct('item_id')->count('item_id'),
                'dismissed_reports' => Report::dismissed()->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all reports submitted by the currently authenticated user
     * Used by the frontend to restore "reported" item state on page load
     */
    public function myReports(Request $request)
    {
        try {
            $userId = auth()->id();

            // Return ALL reports (pending, struck, dismissed) for history in the My Reports tab
            $reports = Report::where('r_user_id', $userId)
                ->with(['item'])
                ->orderBy('created_at', 'desc')
                ->get();

            // Only pending (status=0) item IDs are "still reported" — used by the Report button state
            $reportedItemIds = $reports
                ->where('status', 0)
                ->pluck('item_id')
                ->unique()
                ->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'reported_item_ids' => $reportedItemIds,
                    'reports' => $reports
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch your reports',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
