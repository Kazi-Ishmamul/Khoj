import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface NotificationActor {
    id: number;
    name: string;
    pic_url?: string;
    role?: 'user' | 'admin';
}

interface NotificationItem {
    notification_id: number;
    user_id: number;
    type: string;
    message: string;
    related_type?: string | null;
    related_id?: number | null;
    actor_id?: number | null;
    is_read: boolean | number;
    created_at: string;
    created_at_human?: string | null;
    actor?: NotificationActor | null;
}

type FilterType = 'all' | 'unread' | 'read';

const typeMeta: Record<string, { label: string; accent: string; soft: string }> = {
    item_claimed: { label: 'Claimed post', accent: 'from-sky-500 to-blue-600', soft: 'bg-sky-50 text-sky-700 border-sky-200' },
    claim_accepted: { label: 'Claim accepted', accent: 'from-emerald-500 to-green-600', soft: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    claim_declined: { label: 'Claim declined', accent: 'from-amber-500 to-orange-600', soft: 'bg-amber-50 text-amber-700 border-amber-200' },
    item_struck: { label: 'Post struck', accent: 'from-rose-500 to-red-600', soft: 'bg-rose-50 text-rose-700 border-rose-200' },
    report_struck: { label: 'Report struck', accent: 'from-rose-500 to-red-600', soft: 'bg-rose-50 text-rose-700 border-rose-200' },
    report_dismissed: { label: 'Report dismissed', accent: 'from-violet-500 to-purple-600', soft: 'bg-violet-50 text-violet-700 border-violet-200' },
};

const getMeta = (type: string) => typeMeta[type] ?? {
    label: 'Notification',
    accent: 'from-slate-500 to-slate-700',
    soft: 'bg-slate-50 text-slate-700 border-slate-200',
};

const isRead = (value: boolean | number) => value === true || value === 1;

const relativeTime = (dateValue: string) => {
    const date = new Date(dateValue);
    const diff = Date.now() - date.getTime();
    const minutes = Math.max(1, Math.floor(diff / 60000));

    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
};

const getNotificationTimeLabel = (notification: NotificationItem) =>
    notification.created_at_human || relativeTime(notification.created_at);

export default function Notifications() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [filter, setFilter] = useState<FilterType>('all');

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                setNotifications([]);
                return;
            }

            const response = await axios.get('http://localhost:8000/api/notifications', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (response.data?.success) {
                setNotifications(response.data.data.notifications || []);
            } else {
                setNotifications([]);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
            toast.error('Failed to load notifications');
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const filteredNotifications = useMemo(() => {
        if (filter === 'unread') {
            return notifications.filter((notification) => !isRead(notification.is_read));
        }

        if (filter === 'read') {
            return notifications.filter((notification) => isRead(notification.is_read));
        }

        return notifications;
    }, [notifications, filter]);

    const unreadCount = useMemo(
        () => notifications.filter((notification) => !isRead(notification.is_read)).length,
        [notifications]
    );

    const markNotificationAsRead = async (notificationId: number) => {
        try {
            setActionLoading(notificationId);
            const token = localStorage.getItem('token');

            await axios.put(
                `http://localhost:8000/api/notifications/${notificationId}/read`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                }
            );

            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.notification_id === notificationId
                        ? { ...notification, is_read: true }
                        : notification
                )
            );
            window.dispatchEvent(new Event('notifications-updated'));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
            toast.error('Failed to update notification');
        } finally {
            setActionLoading(null);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');

            await axios.put(
                'http://localhost:8000/api/notifications/read-all',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                }
            );

            setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));
            toast.success('All notifications marked as read');
            window.dispatchEvent(new Event('notifications-updated'));
        } catch (error) {
            console.error('Failed to mark all notifications as read', error);
            toast.error('Failed to update notifications');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-10 px-4">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Activity center</p>
                        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Notifications</h1>
                        <p className="mt-2 max-w-2xl text-slate-600">
                            Keep track of claims, moderation actions, and report outcomes in one place.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Unread</p>
                            <p className="text-2xl font-black text-slate-900">{unreadCount}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
                            <p className="text-2xl font-black text-slate-900">{notifications.length}</p>
                        </div>
                        <button
                            type="button"
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0}
                            className="rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                            Mark all read
                        </button>
                    </div>
                </div>

                <div className="mb-6 flex flex-wrap gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
                    {(['all', 'unread', 'read'] as FilterType[]).map((item) => {
                        const active = filter === item;
                        return (
                            <button
                                key={item}
                                type="button"
                                onClick={() => setFilter(item)}
                                className={`rounded-2xl px-4 py-2 text-sm font-semibold capitalize transition ${active
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {item}
                            </button>
                        );
                    })}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse">
                                <div className="h-4 w-28 rounded bg-slate-200" />
                                <div className="mt-4 h-5 w-3/4 rounded bg-slate-200" />
                                <div className="mt-3 h-4 w-1/2 rounded bg-slate-200" />
                            </div>
                        ))}
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 px-8 py-16 text-center shadow-sm">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">🔔</div>
                        <h2 className="mt-4 text-2xl font-black text-slate-900">No notifications yet</h2>
                        <p className="mt-2 text-slate-600">
                            When someone claims your post, your claim is reviewed, or an admin moderates a report, it will appear here.
                        </p>
                        <Link
                            to="/user-dashboard/items"
                            className="mt-6 inline-flex rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700"
                        >
                            Go to items
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredNotifications.map((notification) => {
                            const meta = getMeta(notification.type);
                            const unread = !isRead(notification.is_read);

                            return (
                                <article
                                    key={notification.notification_id}
                                    className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:shadow-md ${unread ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-200'
                                        }`}
                                >
                                    <div className={`h-1 bg-gradient-to-r ${meta.accent}`} />
                                    <div className="p-5 md:p-6">
                                        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${meta.soft}`}>
                                                    {unread ? '●' : '•'}
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${meta.soft}`}>
                                                            {meta.label}
                                                        </span>
                                                        <span className="text-xs font-medium text-slate-500">
                                                            {getNotificationTimeLabel(notification)}
                                                        </span>
                                                    </div>

                                                    <p className="mt-3 text-base leading-relaxed text-slate-800">
                                                        {notification.message}
                                                    </p>

                                                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                                                        {notification.related_type && (
                                                            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold uppercase tracking-wide">
                                                                {notification.related_type}
                                                                {notification.related_id ? ` #${notification.related_id}` : ''}
                                                            </span>
                                                        )}
                                                        {notification.actor?.name && (
                                                            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold">
                                                                by {notification.actor.name}
                                                            </span>
                                                        )}
                                                        {unread && (
                                                            <span className="rounded-full bg-blue-50 px-3 py-1 font-bold text-blue-700">
                                                                Unread
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-3 md:justify-end">
                                                {!unread && (
                                                    <span className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-500">
                                                        Read
                                                    </span>
                                                )}

                                                {unread && (
                                                    <button
                                                        type="button"
                                                        onClick={() => markNotificationAsRead(notification.notification_id)}
                                                        disabled={actionLoading === notification.notification_id}
                                                        className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-slate-400"
                                                    >
                                                        {actionLoading === notification.notification_id ? 'Updating...' : 'Mark read'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
