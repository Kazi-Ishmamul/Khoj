<?php

namespace App\Http\Controllers;

use App\Models\UserNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = auth()->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }

            $notifications = UserNotification::where('user_id', $user->id)
                ->with(['actor'])
                ->orderByDesc('created_at')
                ->orderByDesc('notification_id')
                ->get()
                ->map(function (UserNotification $notification) {
                    $notification->created_at_human = $notification->created_at
                        ? $notification->created_at
                            ->copy()
                            ->setTimezone(config('app.timezone'))
                            ->diffForHumans(now(config('app.timezone')))
                        : null;

                    return $notification;
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'notifications' => $notifications,
                    'unread_count' => $notifications->where('is_read', false)->count(),
                    'total_count' => $notifications->count(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function unreadCount(Request $request)
    {
        try {
            $user = auth()->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }

            $count = UserNotification::where('user_id', $user->id)
                ->where('is_read', 0)
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'unread_count' => $count,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch unread count',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function markAsRead(Request $request, $notificationId)
    {
        try {
            $user = auth()->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }

            $notification = UserNotification::where('notification_id', $notificationId)
                ->where('user_id', $user->id)
                ->first();

            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notification not found'
                ], 404);
            }

            $notification->update(['is_read' => 1]);

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read',
                'data' => $notification->fresh(['actor'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function markAllAsRead(Request $request)
    {
        try {
            $user = auth()->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }

            UserNotification::where('user_id', $user->id)
                ->where('is_read', 0)
                ->update(['is_read' => 1]);

            return response()->json([
                'success' => true,
                'message' => 'All notifications marked as read'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}