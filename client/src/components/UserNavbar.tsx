import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
    FaBars, FaBell, FaTimes, FaBoxOpen, FaClipboardList,
    FaUserCircle, FaSignOutAlt, FaGlobeAmericas
} from 'react-icons/fa';
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

const navLinks = [
    { label: 'Items', path: '/user-dashboard/items', icon: <FaBoxOpen /> },
    { label: 'My Activity', path: '/user-dashboard/activity', icon: <FaClipboardList /> },
    { label: 'Global Map', path: '/user-dashboard/map', icon: <FaGlobeAmericas /> },
];

const UserNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [notificationActionId, setNotificationActionId] = useState<number | null>(null);
    const [bellPulse, setBellPulse] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

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
                const newCount = response.data.data.unread_count || 0;
                if (newCount > unreadCount) {
                    setBellPulse(true);
                    setTimeout(() => setBellPulse(false), 1500);
                }
                setUnreadCount(newCount);
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
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-sm"
                onClick={() => setShowNotifications(false)}
            />

            {/* Panel */}
            <div className="fixed inset-x-0 top-0 bottom-0 z-50 flex items-start justify-center p-4 sm:p-8 pt-20 sm:pt-24 overflow-y-auto">
                <div className="w-full max-w-2xl rounded-3xl bg-slate-900 shadow-2xl ring-1 ring-white/10 overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800/60 to-slate-900">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/20">
                                <FaBell className="text-sky-400 text-base" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">Inbox</p>
                                <h2 className="text-xl font-black text-white leading-tight">Your Notifications</h2>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowNotifications(false)}
                            className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200 border border-slate-700"
                            aria-label="Close"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Subheader / Mark all */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800/80 bg-slate-900/60">
                        <p className="text-sm text-slate-400">
                            <span className="font-bold text-white">{unreadCount}</span> unread
                        </p>
                        <button
                            type="button"
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0}
                            className="rounded-xl bg-sky-600 px-4 py-1.5 text-xs font-bold text-white transition-all duration-200 hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
                        >
                            Mark all read
                        </button>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[55vh] overflow-y-auto bg-slate-950/60 p-4 space-y-2">
                        {loadingNotifications ? (
                            <>
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 animate-pulse">
                                        <div className="h-3 w-32 rounded bg-slate-700 mb-3" />
                                        <div className="h-3 w-3/4 rounded bg-slate-700" />
                                    </div>
                                ))}
                            </>
                        ) : notifications.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/50 px-6 py-14 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20 text-2xl mb-4">
                                    🔔
                                </div>
                                <p className="text-base font-bold text-slate-100">No notifications yet</p>
                                <p className="mt-2 text-sm text-slate-500">You'll see updates here when something changes on your posts or claims.</p>
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                const unread = !isRead(notification.is_read);
                                const timeLabel = getNotificationTimeLabel(notification);

                                return (
                                    <div
                                        key={notification.notification_id}
                                        className={`group rounded-2xl border p-4 transition-all duration-200 ${
                                            unread
                                                ? 'border-sky-500/30 bg-slate-900 shadow-md shadow-sky-900/10'
                                                : 'border-slate-800 bg-slate-900/50 opacity-75'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${unread ? 'bg-sky-400' : 'bg-slate-600'}`} />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-white leading-snug">{notification.message}</p>
                                                <p className="mt-1 text-xs text-slate-500">{timeLabel}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => !unread ? void 0 : markNotificationAsRead(notification.notification_id)}
                                                disabled={!unread || notificationActionId === notification.notification_id}
                                                className={`flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200 disabled:cursor-not-allowed ${
                                                    unread
                                                        ? 'bg-sky-600/20 text-sky-300 hover:bg-sky-600/40 border border-sky-600/30'
                                                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                                                }`}
                                            >
                                                {notificationActionId === notification.notification_id ? '...' : unread ? 'Mark read' : 'Read'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </>
    ) : null;

    return (
        <>
            <nav
                className="sticky top-0 z-50 border-b border-slate-700/60 bg-slate-950/95 shadow-xl shadow-black/30 backdrop-blur-2xl"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex justify-between items-center h-16">

                        {/* Logo */}
                        <Link to="/" className="flex-shrink-0" style={{ textDecoration: 'none' }}>
                            <KhojLogo />
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 no-underline ${
                                        isActive(link.path)
                                            ? 'text-white'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <span className="text-base text-slate-500">
                                        {link.icon}
                                    </span>
                                    {link.label}
                                </Link>
                            ))}

                            {/* Notification Bell */}
                            <button
                                type="button"
                                onClick={openNotifications}
                                className={`relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 ${
                                    unreadCount > 0
                                        ? 'border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20'
                                        : 'border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                                aria-label="Open notifications"
                            >
                                <FaBell className={`text-base ${bellPulse ? 'animate-bounce' : ''}`} />
                                {unreadCount > 0 && (
                                    <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-black text-white shadow-lg shadow-rose-900/50 ring-2 ring-slate-950">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Profile */}
                            <Link
                                to="/user-dashboard/profile"
                                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 no-underline ${
                                    isActive('/user-dashboard/profile')
                                        ? 'text-white'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                                style={{ textDecoration: 'none' }}
                            >
                                <span className="text-base text-slate-500">
                                    <FaUserCircle />
                                </span>
                                Profile
                            </Link>

                            {/* Divider */}
                            <div className="h-6 w-px bg-slate-700/60 mx-1" />

                            {/* Logout */}
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex items-center gap-2 ml-1 rounded-xl px-4 py-2 text-sm font-semibold text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/40 transition-all duration-200"
                            >
                                <FaSignOutAlt className="text-base text-rose-500" />
                                Logout
                            </button>
                        </div>

                        {/* Mobile — Bell + Hamburger */}
                        <div className="flex items-center gap-2 md:hidden">
                            <button
                                type="button"
                                onClick={openNotifications}
                                className={`relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 ${
                                    unreadCount > 0
                                        ? 'border-sky-500/40 bg-sky-500/10 text-sky-300'
                                        : 'border-slate-700 bg-slate-900 text-slate-400'
                                }`}
                                aria-label="Open notifications"
                            >
                                <FaBell className="text-base" />
                                {unreadCount > 0 && (
                                    <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-black text-white ring-2 ring-slate-950">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200 focus:outline-none"
                                aria-label="Toggle menu"
                            >
                                {isOpen ? <FaTimes className="text-base" /> : <FaBars className="text-base" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <div
                        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
                            isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
                        }`}
                    >
                        <div className="flex flex-col gap-1 rounded-2xl border border-slate-700/60 bg-slate-900/90 p-2 backdrop-blur-sm mt-2">
                            {/* Items and My Activity */}
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 text-slate-400 hover:bg-slate-800/60 hover:text-white"
                                    style={{ textDecoration: 'none' }}
                                >
                                    <span className="text-base text-slate-500">
                                        {link.icon}
                                    </span>
                                    {link.label}
                                </Link>
                            ))}

                            {/* Profile */}
                            <Link
                                to="/user-dashboard/profile"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 text-slate-400 hover:bg-slate-800/60 hover:text-white"
                                style={{ textDecoration: 'none' }}
                            >
                                <span className="text-base text-slate-500">
                                    <FaUserCircle />
                                </span>
                                Profile
                            </Link>

                            {/* Logout */}
                            <button
                                type="button"
                                onClick={() => { setIsOpen(false); handleLogout(); }}
                                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-all duration-200 text-left"
                            >
                                <span className="text-base text-rose-500"><FaSignOutAlt /></span>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {typeof document !== 'undefined' && notificationModal
                ? createPortal(notificationModal, document.body)
                : null}
        </>
    );
};

export default UserNavbar;
