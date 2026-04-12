@extends('admin.layout')

@section('title', 'Analytics')

@php
    $catLabels = collect($categories)->pluck('name')->values()->all();
    $catCounts = collect($categories)->pluck('count')->values()->all();
    $catColors = [
        'rgba(56, 189, 248, 0.85)', 'rgba(167, 139, 250, 0.85)', 'rgba(52, 211, 153, 0.85)',
        'rgba(251, 191, 36, 0.85)', 'rgba(244, 114, 182, 0.85)', 'rgba(148, 163, 184, 0.85)',
        'rgba(34, 211, 238, 0.85)', 'rgba(192, 132, 252, 0.85)', 'rgba(74, 222, 128, 0.85)',
        'rgba(251, 146, 60, 0.85)', 'rgba(248, 113, 113, 0.85)', 'rgba(94, 234, 212, 0.85)',
    ];
@endphp

@section('content')
    <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem;">
        <div>
            <h1 style="margin: 0; font-size: 1.75rem; letter-spacing: -0.02em;">Analytics</h1>
            <p class="muted" style="margin: 0.35rem 0 0;">Lost &amp; found overview — {{ $periodLabel }}</p>
        </div>
        <form method="get" action="{{ route('admin.analytics') }}" style="display: flex; align-items: center; gap: 0.5rem;">
            <label class="muted" for="range" style="font-size: 0.875rem;">Period</label>
            <select name="range" id="range" onchange="this.form.submit()"
                style="padding: 0.5rem 0.75rem; border-radius: 0.65rem; border: 1px solid var(--border); background: var(--surface); color: var(--text); font-size: 0.875rem;">
                <option value="7" @selected($range === '7')>Last 7 days</option>
                <option value="30" @selected($range === '30')>Last 30 days</option>
                <option value="all" @selected($range === 'all')>All time</option>
            </select>
        </form>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <div class="card" style="border-left: 3px solid #f43f5e;">
            <p class="muted" style="margin: 0 0 0.35rem; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.08em;">Lost items</p>
            <p style="margin: 0; font-size: 2rem; font-weight: 700;">{{ number_format($lostCount) }}</p>
        </div>
        <div class="card" style="border-left: 3px solid #34d399;">
            <p class="muted" style="margin: 0 0 0.35rem; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.08em;">Found items</p>
            <p style="margin: 0; font-size: 2rem; font-weight: 700;">{{ number_format($foundCount) }}</p>
        </div>
        <div class="card" style="border-left: 3px solid #38bdf8;">
            <p class="muted" style="margin: 0 0 0.35rem; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.08em;">Active users</p>
            <p style="margin: 0; font-size: 2rem; font-weight: 700;">{{ number_format($activeUsersCount) }}</p>
            <p class="muted" style="margin: 0.5rem 0 0; font-size: 0.75rem;">Users who posted in this period</p>
        </div>
        <div class="card" style="border-left: 3px solid #a78bfa;">
            <p class="muted" style="margin: 0 0 0.35rem; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.08em;">Registered users</p>
            <p style="margin: 0; font-size: 2rem; font-weight: 700;">{{ number_format($totalRegisteredUsers) }}</p>
            @if($newUsersInPeriod !== null)
                <p class="muted" style="margin: 0.5rem 0 0; font-size: 0.75rem;">+{{ number_format($newUsersInPeriod) }} new in period</p>
            @endif
        </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; align-items: start;">
        <div class="card">
            <h2 style="margin: 0 0 1rem; font-size: 1.1rem;">Lost vs found</h2>
            <div style="max-width: 340px; margin: 0 auto;">
                <canvas id="chartLostFound" height="220"></canvas>
            </div>
        </div>
        <div class="card">
            <h2 style="margin: 0 0 1rem; font-size: 1.1rem;">Top categories</h2>
            @if(count($categories) === 0)
                <p class="muted">No category data for this period.</p>
            @else
                <div style="max-height: 320px;">
                    <canvas id="chartCategories" height="280"></canvas>
                </div>
            @endif
        </div>
    </div>

    @if(count($categories) > 0)
        <div class="card" style="margin-top: 1.5rem;">
            <h2 style="margin: 0 0 1rem; font-size: 1.1rem;">Category breakdown</h2>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                    <thead>
                        <tr style="text-align: left; border-bottom: 1px solid var(--border); color: var(--muted);">
                            <th style="padding: 0.65rem 0;">Category</th>
                            <th style="padding: 0.65rem 0;">Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($categories as $row)
                            <tr style="border-bottom: 1px solid rgba(51, 65, 85, 0.6);">
                                <td style="padding: 0.65rem 0;">{{ $row['name'] }}</td>
                                <td style="padding: 0.65rem 0;">{{ number_format($row['count']) }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    @endif
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<script>
(function () {
    const lost = {{ (int) $lostCount }};
    const found = {{ (int) $foundCount }};

    new Chart(document.getElementById('chartLostFound'), {
        type: 'doughnut',
        data: {
            labels: ['Lost', 'Found'],
            datasets: [{
                data: [lost, found],
                backgroundColor: ['rgba(244, 63, 94, 0.85)', 'rgba(52, 211, 153, 0.85)'],
                borderWidth: 0,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'DM Sans' } } }
            }
        }
    });

    @if(count($categories) > 0)
    const catLabels = @json($catLabels);
    const catCounts = @json($catCounts);
    const catColors = @json(array_slice($catColors, 0, max(count($catLabels), 1)));

    new Chart(document.getElementById('chartCategories'), {
        type: 'bar',
        data: {
            labels: catLabels,
            datasets: [{
                label: 'Items',
                data: catCounts,
                backgroundColor: catLabels.map((_, i) => catColors[i % catColors.length]),
                borderRadius: 6,
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: { color: 'rgba(51, 65, 85, 0.5)' },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: '#cbd5e1', font: { size: 11 } }
                }
            }
        }
    });
    @endif
})();
</script>
@endpush
