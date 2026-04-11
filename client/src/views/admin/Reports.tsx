import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface User {
    id: number;
    name: string;
    email?: string;
    pic_url?: string;
}

interface Item {
    id: number;
    item_name: string;
    category?: string;
    description?: string;
    location?: string;
    status: 'lost' | 'found';
    resolution_status: 'not_claimed' | 'claimed' | 'resolved';
    valid: number;
    item_image_url?: string;
    user?: User;
}

interface Report {
    report_id: number;
    item_id: number;
    r_user_id: number;
    reason: string;
    status: number; // 0: pending, -1: struck, 1: dismissed
    created_at: string;
    item?: Item;
    reported_by?: User;
}

interface PaginatedResponse {
    data: Report[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface Stats {
    total_reports: number;
    pending_reports: number;
    struck_reports: number;
    dismissed_reports: number;
}

// Group reports by item_id
function groupByItem(reports: Report[]): Map<number, Report[]> {
    const map = new Map<number, Report[]>();
    for (const r of reports) {
        const list = map.get(r.item_id) || [];
        list.push(r);
        map.set(r.item_id, list);
    }
    return map;
}

export default function Reports() {
    const [reports, setReports] = useState<Report[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalReports, setTotalReports] = useState(0);
    const [confirmModal, setConfirmModal] = useState<{
        type: 'strike' | 'dismiss';
        reportId: number;
        itemName: string;
        allReportsCount: number;
    } | null>(null);
    const [expandedItem, setExpandedItem] = useState<number | null>(null);

    const token = localStorage.getItem('token');

    const authHeaders = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
    };

    const fetchReports = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const res = await axios.get<{ success: boolean; data: PaginatedResponse }>(
                `http://localhost:8000/api/reports?page=${page}`,
                { headers: authHeaders }
            );
            if (res.data.success) {
                const pd = res.data.data;
                setReports(pd.data);
                setCurrentPage(pd.current_page);
                setLastPage(pd.last_page);
                setTotalReports(pd.total);
            }
        } catch {
            toast.error('Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            setStatsLoading(true);
            const res = await axios.get<{ success: boolean; data: Stats }>(
                'http://localhost:8000/api/reports/stats',
                { headers: authHeaders }
            );
            if (res.data.success) setStats(res.data.data);
        } catch {
            // silently fail stats
        } finally {
            setStatsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports(1);
        fetchStats();
    }, [fetchReports, fetchStats]);

    const handleStrike = async (reportId: number) => {
        try {
            setActionLoading(reportId);
            const res = await axios.post(
                `http://localhost:8000/api/reports/${reportId}/strike`,
                {},
                { headers: authHeaders }
            );
            if (res.data.success) {
                toast.success('⚡ Report struck! Item soft-deleted & all claims declined.');
                setConfirmModal(null);
                await fetchReports(currentPage);
                await fetchStats();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to strike report');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDismiss = async (reportId: number) => {
        try {
            setActionLoading(reportId);
            const res = await axios.post(
                `http://localhost:8000/api/reports/${reportId}/dismiss`,
                {},
                { headers: authHeaders }
            );
            if (res.data.success) {
                toast.success('✅ Report dismissed — item remains active.');
                setConfirmModal(null);
                await fetchReports(currentPage);
                await fetchStats();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to dismiss report');
        } finally {
            setActionLoading(null);
        }
    };

    const grouped = groupByItem(reports);
    const groupedEntries = Array.from(grouped.entries());

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <span className="text-xl">🚨</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Report Management</h1>
                    </div>
                    <p className="text-slate-400 ml-[52px]">Review pending reports and take action — Strike removes the item, Dismiss keeps it live.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {[
                        { label: 'Total Reports', value: stats?.total_reports, icon: '📋', color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30', text: 'text-blue-400' },
                        { label: 'Pending', value: stats?.pending_reports, icon: '⏳', color: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/30', text: 'text-amber-400' },
                        { label: 'Struck', value: stats?.struck_reports, icon: '⚡', color: 'from-red-500/20 to-red-600/10', border: 'border-red-500/30', text: 'text-red-400' },
                        { label: 'Dismissed', value: stats?.dismissed_reports, icon: '✅', color: 'from-green-500/20 to-green-600/10', border: 'border-green-500/30', text: 'text-green-400' },
                    ].map((stat) => (
                        <div key={stat.label} className={`rounded-2xl bg-gradient-to-br ${stat.color} border ${stat.border} p-5 backdrop-blur-sm`}>
                            <div className="text-2xl mb-1">{stat.icon}</div>
                            <div className={`text-3xl font-black ${stat.text}`}>
                                {statsLoading ? <span className="animate-pulse text-slate-500">—</span> : (stat.value ?? 0)}
                            </div>
                            <div className="text-slate-400 text-sm font-medium mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Section Title */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">
                        Pending Reports
                        {!loading && <span className="ml-2 text-sm font-normal text-slate-500">({totalReports} total)</span>}
                    </h2>
                    <button
                        onClick={() => fetchReports(currentPage)}
                        className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                        </svg>
                        Refresh
                    </button>
                </div>

                {/* Reports List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-6 animate-pulse">
                                <div className="h-5 bg-slate-700 rounded w-1/3 mb-3" />
                                <div className="h-4 bg-slate-700 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : groupedEntries.length === 0 ? (
                    <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-16 text-center">
                        <div className="text-5xl mb-4">🎉</div>
                        <p className="text-xl font-semibold text-slate-300">No pending reports!</p>
                        <p className="text-slate-500 mt-2">All reports have been resolved.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {groupedEntries.map(([itemId, itemReports]) => {
                            const firstReport = itemReports[0];
                            const item = firstReport?.item;
                            const isExpanded = expandedItem === itemId;
                            const reportCount = itemReports.length;

                            return (
                                <div
                                    key={itemId}
                                    className="rounded-2xl bg-slate-800/70 border border-slate-700/50 overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-slate-600/70"
                                >
                                    {/* Item Header */}
                                    <div className="p-5 flex flex-col md:flex-row gap-4">
                                        {/* Item Image */}
                                        <div className="flex-shrink-0">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-700">
                                                {item?.item_image_url ? (
                                                    <img
                                                        src={item.item_image_url}
                                                        alt={item.item_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Item Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-start gap-2 mb-2">
                                                <h3 className="text-lg font-bold text-white">{item?.item_name || `Item #${itemId}`}</h3>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    item?.status === 'lost'
                                                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                        : 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                }`}>
                                                    {item?.status === 'lost' ? '🔴 LOST' : '🟢 FOUND'}
                                                </span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    item?.valid === 0
                                                        ? 'bg-slate-600/60 text-slate-400 border border-slate-600'
                                                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                }`}>
                                                    {item?.valid === 0 ? '🚫 Soft-Deleted' : '✓ Active'}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-3">
                                                {item?.category && <span>📁 {item.category}</span>}
                                                {item?.location && <span>📍 {item.location}</span>}
                                                {item?.user && (
                                                    <span className="flex items-center gap-1">
                                                        <img
                                                            src={item.user.pic_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user.name)}&background=4F46E5&color=fff&size=32`}
                                                            alt={item.user.name}
                                                            className="w-4 h-4 rounded-full"
                                                        />
                                                        Posted by <span className="text-slate-300 font-medium">{item.user.name}</span>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Report count badge + expand toggle */}
                                            <button
                                                onClick={() => setExpandedItem(isExpanded ? null : itemId)}
                                                className="flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                                            >
                                                <span className="bg-amber-500/20 border border-amber-500/30 rounded-full px-2.5 py-0.5 text-xs">
                                                    {reportCount} report{reportCount > 1 ? 's' : ''}
                                                </span>
                                                <span>{isExpanded ? '▲ Collapse' : '▼ View Reports'}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Reports */}
                                    {isExpanded && (
                                        <div className="border-t border-slate-700/50 divide-y divide-slate-700/30">
                                            {itemReports.map((report, idx) => (
                                                <div key={report.report_id} className="px-5 py-4">
                                                    <div className="flex flex-col md:flex-row gap-4 items-start">
                                                        {/* Reporter Info */}
                                                        <div className="flex items-center gap-3 flex-shrink-0 min-w-[200px]">
                                                            <img
                                                                src={report.reported_by?.pic_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(report.reported_by?.name || 'User')}&background=6366f1&color=fff&size=40`}
                                                                alt={report.reported_by?.name}
                                                                className="w-10 h-10 rounded-full border-2 border-slate-600"
                                                            />
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-200">{report.reported_by?.name || 'Unknown User'}</p>
                                                                <p className="text-xs text-slate-500">{report.reported_by?.email}</p>
                                                            </div>
                                                        </div>

                                                        {/* Reason */}
                                                        <div className="flex-1">
                                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Report #{idx + 1} — Reason</p>
                                                            <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/40 rounded-lg p-3 italic">
                                                                "{report.reason}"
                                                            </p>
                                                            <p className="text-xs text-slate-600 mt-1">
                                                                Reported on {new Date(report.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                            </p>
                                                        </div>

                                                        {/* Status + Actions */}
                                                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                                report.status === 0
                                                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                                                    : report.status === -1
                                                                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                                                    : 'bg-green-500/20 text-green-400 border-green-500/30'
                                                            }`}>
                                                                {report.status === 0 ? '⏳ Pending' : report.status === -1 ? '⚡ Struck' : '✅ Dismissed'}
                                                            </span>

                                                            {report.status === 0 && (
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() =>
                                                                            setConfirmModal({
                                                                                type: 'strike',
                                                                                reportId: report.report_id,
                                                                                itemName: item?.item_name || `Item #${itemId}`,
                                                                                allReportsCount: reportCount,
                                                                            })
                                                                        }
                                                                        disabled={actionLoading === report.report_id}
                                                                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg hover:shadow-red-500/25 transition-all transform hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        {actionLoading === report.report_id ? '⏳' : '⚡ Strike'}
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            setConfirmModal({
                                                                                type: 'dismiss',
                                                                                reportId: report.report_id,
                                                                                itemName: item?.item_name || `Item #${itemId}`,
                                                                                allReportsCount: 1,
                                                                            })
                                                                        }
                                                                        disabled={actionLoading === report.report_id}
                                                                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-white text-xs font-bold shadow-lg transition-all transform hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        {actionLoading === report.report_id ? '⏳' : '✓ Dismiss'}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {lastPage > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-10">
                        <button
                            onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); fetchReports(currentPage - 1); }}
                            disabled={currentPage === 1}
                            className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            ← Previous
                        </button>
                        <span className="text-slate-400 text-sm font-medium">
                            Page <span className="text-white">{currentPage}</span> of <span className="text-white">{lastPage}</span>
                        </span>
                        <button
                            onClick={() => { setCurrentPage(p => Math.min(lastPage, p + 1)); fetchReports(currentPage + 1); }}
                            disabled={currentPage === lastPage}
                            className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {confirmModal && (
                <>
                    <div
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
                        onClick={() => !actionLoading && setConfirmModal(null)}
                    />
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

                            {/* Modal accent bar */}
                            <div className={`h-1.5 w-full ${confirmModal.type === 'strike' ? 'bg-gradient-to-r from-red-500 to-rose-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`} />

                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                                        confirmModal.type === 'strike' ? 'bg-red-500/20' : 'bg-emerald-500/20'
                                    }`}>
                                        {confirmModal.type === 'strike' ? '⚡' : '✅'}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">
                                            {confirmModal.type === 'strike' ? 'Strike Report' : 'Dismiss Report'}
                                        </h3>
                                        <p className="text-sm text-slate-400">
                                            {confirmModal.type === 'strike' ? 'This action has cascading effects' : 'Mark report as invalid'}
                                        </p>
                                    </div>
                                </div>

                                <div className={`rounded-xl p-4 mb-5 ${
                                    confirmModal.type === 'strike'
                                        ? 'bg-red-500/10 border border-red-500/20'
                                        : 'bg-emerald-500/10 border border-emerald-500/20'
                                }`}>
                                    <p className="text-sm text-slate-300 mb-3">
                                        You are about to <strong className={confirmModal.type === 'strike' ? 'text-red-400' : 'text-emerald-400'}>
                                            {confirmModal.type === 'strike' ? 'STRIKE' : 'DISMISS'}
                                        </strong> a report on:
                                    </p>
                                    <p className="text-base font-bold text-white mb-1">"{confirmModal.itemName}"</p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setConfirmModal(null)}
                                        disabled={!!actionLoading}
                                        className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold text-sm transition-all disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() =>
                                            confirmModal.type === 'strike'
                                                ? handleStrike(confirmModal.reportId)
                                                : handleDismiss(confirmModal.reportId)
                                        }
                                        disabled={!!actionLoading}
                                        className={`flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all transform hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                                            confirmModal.type === 'strike'
                                                ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 hover:shadow-red-500/30'
                                                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-500/30'
                                        }`}
                                    >
                                        {actionLoading
                                            ? '⏳ Processing...'
                                            : confirmModal.type === 'strike'
                                            ? '⚡ Confirm Strike'
                                            : '✅ Confirm Dismiss'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
