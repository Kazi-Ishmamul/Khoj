import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { FaBars, FaBell, FaTimes } from 'react-icons/fa';
import KhojLogo from './KhojLogo';
import { clearAuthStorage } from '../helpers/auth';

interface NotificationActor {
    id: number;
    name: string;
    pic_url?: string;
    role?: 'user' | 'admin';
}

interface NotificationItem {
    notification_id: number;
    type: string;
    message: string;
    related_type?: string | null;
    related_id?: number | null;
    is_read: boolean | number;
    created_at: string;
    created_at_human?: string | null;
    actor?: NotificationActor | null;
}

const isRead = (value: boolean | number) => value === true || value === 1;

const parseNotificationDate = (dateValue: string) => {
    const normalized = dateValue.trim().replace(' ', 'T');
    const parsed = new Date(normalized);

    if (!Number.isNaN(parsed.getTime())) {
        return parsed;
    }

    const mysqlMatch = dateValue.match(
        /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?$/
    );

    if (mysqlMatch) {
        const [, year, month, day, hour, minute, second] = mysqlMatch;
        return new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            Number(minute),
            Number(second)
        );
    }

    return new Date(dateValue);
};

const relativeTime = (dateValue: string) => {
    const date = parseNotificationDate(dateValue);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const diffMs = Date.now() - date.getTime();
    const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));

    if (diffSeconds < 5) return 'just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
};

const getNotificationTimeLabel = (notification: NotificationItem) =>
    notification.created_at_human || relativeTime(notification.created_at);

const UserNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [notificationActionId, setNotificationActionId] = useState<number | null>(null);
    const navigate = useNavigate();

    const toggleMenu = () => setIsOpen(!isOpen);

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                setUnreadCount(0);
                return;
            }

            const response = await axios.get('http://localhost:8000/api/notifications/unread-count', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (response.data?.success) {
                setUnreadCount(response.data.data.unread_count || 0);
            }
        } catch {
            setUnreadCount(0);
        }
    };

    const fetchNotifications = async () => {
        try {
            setLoadingNotifications(true);
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
            }
        } catch {
            setNotifications([]);
        } finally {
            setLoadingNotifications(false);
        }
    };

    const openNotifications = async () => {
        setShowNotifications(true);
        await fetchNotifications();
    };

    useEffect(() => {
        fetchUnreadCount();

        const handleNotificationUpdate = () => {
            fetchUnreadCount();
        };

        window.addEventListener('notifications-updated', handleNotificationUpdate);

        return () => {
            window.removeEventListener('notifications-updated', handleNotificationUpdate);
        };
    }, []);

    useEffect(() => {
        const originalOverflow = document.body.style.overflow;

        if (showNotifications) {
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [showNotifications]);

    const handleLogout = () => {
        clearAuthStorage();
        navigate('/');
    };

    const navLinks = [
        { label: 'Items/Products', path: '/user-dashboard/items' },
        { label: 'My Activity', path: '/user-dashboard/activity' },
        { label: 'Profile', path: '/user-dashboard/profile' },
        { label: 'Logout', path: '/' }
    ];

    const markNotificationAsRead = async (notificationId: number) => {
        try {
            setNotificationActionId(notificationId);
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
            await fetchUnreadCount();
            window.dispatchEvent(new Event('notifications-updated'));
        } catch {
            // keep modal usable even if this fails
        } finally {
            setNotificationActionId(null);
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
            setUnreadCount(0);
            window.dispatchEvent(new Event('notifications-updated'));
        } catch {
            // no-op
        }
    };

    const notificationModal = showNotifications ? (
        <>
            <div
                className="fixed inset-x-0 bottom-0 top-[80px] z-40 bg-slate-950/70 backdrop-blur-sm"
                onClick={() => setShowNotifications(false)}
            />
            <div className="fixed inset-x-0 bottom-0 top-[80px] z-40 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
                <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-slate-900 shadow-2xl ring-1 ring-slate-700/70 max-h-[calc(100vh-6rem)] backdrop-blur-sm">
                    <div className="flex items-start justify-between border-b border-slate-700 px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">Notifications</p>
                            <h2 className="mt-1 text-2xl font-black text-white">Your alerts</h2>
                            <p className="mt-1 text-sm text-slate-400">Claims, moderation updates, and report status.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowNotifications(false)}
                            className="rounded-full bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 border border-slate-600"
                        >
                            Close
                        </button>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-b border-slate-700 px-6 py-4 bg-slate-900/80">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <span className="font-bold text-slate-100">{unreadCount}</span>
                            unread notifications
                        </div>
                        <button
                            type="button"
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0}
                            className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-700"
                        >
                            Mark all read
                        </button>
                    </div>

                    <div className="max-h-[calc(100vh-16rem)] overflow-y-auto bg-slate-950 p-4">
                        {loadingNotifications ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-sm animate-pulse">
                                        <div className="h-4 w-28 rounded bg-slate-700" />
                                        <div className="mt-3 h-4 w-3/4 rounded bg-slate-700" />
                                    </div>
                                ))}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 px-6 py-14 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/10 text-2xl">🔔</div>
                                <p className="mt-4 text-lg font-bold text-slate-100">No notifications yet</p>
                                <p className="mt-2 text-sm text-slate-400">You’ll see updates here when something changes on your posts or claims.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {notifications.map((notification) => {
                                    const unread = !isRead(notification.is_read);
                                    const timeLabel = getNotificationTimeLabel(notification);

                                    return (
                                        <div
                                            key={notification.notification_id}
                                            className={`rounded-3xl border p-4 shadow-sm transition ${unread
                                                ? 'border-sky-500/40 bg-slate-900'
                                                : 'border-slate-700 bg-slate-900/70 opacity-90'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 h-2.5 w-2.5 rounded-full ${unread ? 'bg-sky-400' : 'bg-slate-500'}`} />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-white">{notification.message}</p>
                                                    <p className="mt-1 text-xs text-slate-400">{timeLabel}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => !unread ? void 0 : markNotificationAsRead(notification.notification_id)}
                                                    disabled={!unread || notificationActionId === notification.notification_id}
                                                    className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {notificationActionId === notification.notification_id ? '...' : unread ? 'Mark read' : 'Read'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
        ) : null;

    return (
        <>
            <nav className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-gray-700/50 sticky top-0 z-50 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <Link to="/" className="hover:opacity-80 transition">
                            <KhojLogo />
                        </Link>

                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                link.label === 'Logout' ? (
                                    <button
                                        key={link.path}
                                        type="button"
                                        onClick={handleLogout}
                                        className="text-gray-300 hover:text-white font-medium transition duration-200 relative group"
                                    >
                                        {link.label}
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
                                    </button>
                                ) : (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className="text-gray-300 hover:text-white font-medium transition duration-200 relative group"
                                    >
                                        <span className="inline-flex items-center gap-2">{link.label}</span>
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
                                    </Link>
                                )
                            ))}

                            <button
                                type="button"
                                onClick={openNotifications}
                                className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-200 transition hover:bg-white/10 hover:text-white"
                                aria-label="Open notifications"
                            >
                                <FaBell className="text-lg" />
                                {unreadCount > 0 && (
                                    <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[11px] font-bold text-white">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="flex items-center gap-2 md:hidden">
                            <button
                                type="button"
                                onClick={openNotifications}
                                className="relative flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10"
                                aria-label="Open notifications"
                            >
                                <FaBell className="text-lg" />
                                {unreadCount > 0 && (
                                    <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[11px] font-bold text-white">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            <button onClick={toggleMenu} className="text-white text-2xl focus:outline-none">
                                {isOpen ? <FaTimes /> : <FaBars />}
                            </button>
                        </div>
                    </div>

                    {isOpen && (
                        <div className="md:hidden mt-4 flex flex-col gap-4 border-t border-gray-700/50 pt-4">
                            {navLinks.map((link) => (
                                link.label === 'Logout' ? (
                                    <button
                                        key={link.path}
                                        type="button"
                                        onClick={() => {
                                            setIsOpen(false);
                                            handleLogout();
                                        }}
                                        className="text-left text-gray-300 hover:text-white font-medium transition duration-200 block py-2"
                                    >
                                        {link.label}
                                    </button>
                                ) : (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setIsOpen(false)}
                                        className="text-gray-300 hover:text-white font-medium transition duration-200 block py-2"
                                    >
                                        <span className="inline-flex items-center gap-2">{link.label}</span>
                                    </Link>
                                )
                            ))}
                        </div>
                    )}
                </div>
            </nav>

            {typeof document !== 'undefined' && notificationModal ? createPortal(notificationModal, document.body) : null}
        </>
    );
};

export default UserNavbar;
