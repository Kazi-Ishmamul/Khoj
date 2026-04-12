<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminAnalyticsController extends Controller
{
    /**
     * Analytics dashboard.
     *
     * Date filter applies to items.created_at and to "active users" (distinct posters).
     * Categories are aggregated from items.category (string column). Rows with empty
     * category are grouped as "Uncategorized".
     *
     * Query param: range = 7 | 30 | all
     */
    public function index(Request $request)
    {
        $range = $request->query('range', '30');
        if (! in_array($range, ['7', '30', 'all'], true)) {
            $range = '30';
        }

        [$periodStart, $periodEnd] = $this->resolvePeriod($range);

        $itemsBase = Item::query()->where('valid', true);

        if ($periodStart !== null) {
            $itemsBase->whereBetween('created_at', [$periodStart, $periodEnd]);
        }

        $lostCount = (clone $itemsBase)->where('status', 'lost')->count();
        $foundCount = (clone $itemsBase)->where('status', 'found')->count();

        // Most common categories (from items.category text; no separate categories table required)
        $categoryQuery = Item::query()
            ->where('valid', true)
            ->selectRaw("COALESCE(NULLIF(TRIM(category), ''), 'Uncategorized') as category_label")
            ->selectRaw('COUNT(*) as cnt')
            ->groupBy(DB::raw("COALESCE(NULLIF(TRIM(category), ''), 'Uncategorized')"))
            ->orderByDesc('cnt')
            ->limit(12);

        if ($periodStart !== null) {
            $categoryQuery->whereBetween('created_at', [$periodStart, $periodEnd]);
        }

        $categoryRows = $categoryQuery->get();
        $categories = $categoryRows->map(fn ($row) => [
            'name' => $row->category_label,
            'count' => (int) $row->cnt,
        ])->values()->all();

        // Active users: registered users (role user) who posted at least one valid item in range
        $activeUsersCount = (int) User::query()
            ->where('role', 'user')
            ->whereHas('items', function ($q) use ($periodStart, $periodEnd) {
                $q->where('valid', true);
                if ($periodStart !== null) {
                    $q->whereBetween('created_at', [$periodStart, $periodEnd]);
                }
            })
            ->count();

        // Total registered end-users (all time)
        $totalRegisteredUsers = User::query()->where('role', 'user')->count();

        // Optional: new user registrations in the same window
        $newUsersInPeriod = null;
        if ($periodStart !== null) {
            $newUsersInPeriod = User::query()
                ->where('role', 'user')
                ->whereBetween('created_at', [$periodStart, $periodEnd])
                ->count();
        }

        return view('admin.analytics', [
            'range' => $range,
            'periodLabel' => $this->periodLabel($range),
            'periodStart' => $periodStart,
            'periodEnd' => $periodEnd,
            'lostCount' => $lostCount,
            'foundCount' => $foundCount,
            'categories' => $categories,
            'activeUsersCount' => $activeUsersCount,
            'totalRegisteredUsers' => $totalRegisteredUsers,
            'newUsersInPeriod' => $newUsersInPeriod,
        ]);
    }

    /**
     * @return array{0: Carbon|null, 1: Carbon}
     */
    private function resolvePeriod(string $range): array
    {
        $end = Carbon::now();

        if ($range === 'all') {
            return [null, $end];
        }

        $days = $range === '7' ? 7 : 30;
        $start = Carbon::now()->subDays($days)->startOfDay();

        return [$start, $end];
    }

    private function periodLabel(string $range): string
    {
        return match ($range) {
            '7' => 'Last 7 days',
            '30' => 'Last 30 days',
            'all' => 'All time',
            default => 'Last 30 days',
        };
    }
}
