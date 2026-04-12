import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
    FaBars, FaTimes, FaUsers, FaThList, FaFlag, FaUserCog, FaSignOutAlt, FaShieldAlt
} from 'react-icons/fa';
import KhojLogo from './KhojLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { clearAuthStorage } from '../helpers/auth';
import { useI18n } from '../i18n/I18nContext';

const AdminNavbar = () => {
    const { t } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const navLinks = useMemo(
        () => [
            { labelKey: 'admin_nav.users' as const, path: '/admin-dashboard/users', icon: <FaUsers /> },
            { labelKey: 'admin_nav.manage_posts' as const, path: '/admin-dashboard/posts', icon: <FaThList /> },
            { labelKey: 'admin_nav.reports' as const, path: '/admin-dashboard/reports', icon: <FaFlag /> },
            { labelKey: 'admin_nav.profile' as const, path: '/admin-dashboard/profile', icon: <FaUserCog /> },
            { labelKey: 'admin_nav.logout' as const, path: '/', icon: <FaSignOutAlt />, logout: true as const },
        ],
        []
    );

    const handleLogout = () => {
        clearAuthStorage();
        navigate('/');
    };

    return (
        <nav
            className="sticky top-0 z-50 border-b border-slate-700/60 bg-slate-950/95 shadow-xl shadow-black/30 backdrop-blur-2xl"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center h-16">

                    {/* Logo + Admin Badge */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Link to="/" className="no-underline" style={{ textDecoration: 'none' }}>
                            <KhojLogo />
                        </Link>
                        <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 px-2 py-1">
                            <FaShieldAlt className="text-amber-400 text-xs" />
                            <span className="text-xs font-bold text-amber-400 tracking-wide uppercase">{t('admin_nav.admin_badge')}</span>
                        </div>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) =>
                            link.logout ? (
                                <button
                                    key="logout"
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 ml-1 rounded-xl px-4 py-2 text-sm font-semibold text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/40 transition-all duration-200"
                                >
                                    <FaSignOutAlt className="text-base text-rose-500" />
                                    {t(link.labelKey)}
                                </button>
                            ) : (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 no-underline text-slate-400 hover:bg-slate-800/60 hover:text-white"
                                    style={{ textDecoration: 'none' }}
                                >
                                    <span className="text-base text-slate-500">
                                        {link.icon}
                                    </span>
                                    {t(link.labelKey)}
                                </Link>
                            )
                        )}
                        <LanguageSwitcher
                            id="admin-nav-locale"
                            selectClassName="ml-2 h-10 cursor-pointer rounded-xl border border-slate-700 bg-slate-900 px-2.5 text-sm font-semibold text-slate-200 outline-none transition-colors hover:border-slate-600 focus-visible:ring-2 focus-visible:ring-amber-500/40"
                        />
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200 focus:outline-none"
                        aria-label={t('admin_nav.toggle_menu')}
                    >
                        {isOpen ? <FaTimes className="text-base" /> : <FaBars className="text-base" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
                        isOpen ? 'max-h-[28rem] opacity-100 pb-4' : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className="flex flex-col gap-1 rounded-2xl border border-slate-700/60 bg-slate-900/90 p-2 backdrop-blur-sm mt-2">
                        <div className="flex items-center gap-2 px-4 py-2">
                            <FaShieldAlt className="text-amber-400 text-xs" />
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{t('admin_nav.admin_panel')}</span>
                        </div>
                        <div className="h-px bg-slate-700/60 mx-2 mb-1" />

                        {navLinks.map((link) =>
                            link.logout ? (
                                <button
                                    key="logout"
                                    type="button"
                                    onClick={() => { setIsOpen(false); handleLogout(); }}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-all duration-200 text-left"
                                >
                                    <span className="text-base text-rose-500"><FaSignOutAlt /></span>
                                    {t(link.labelKey)}
                                </button>
                            ) : (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 no-underline text-slate-400 hover:bg-slate-800/60 hover:text-white"
                                    style={{ textDecoration: 'none' }}
                                >
                                    <span className="text-base text-slate-500">
                                        {link.icon}
                                    </span>
                                    {t(link.labelKey)}
                                </Link>
                            )
                        )}
                        <div className="px-4 py-2">
                            <LanguageSwitcher
                                id="admin-nav-locale-mobile"
                                selectClassName="h-10 w-full max-w-xs cursor-pointer rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm font-semibold text-slate-200 outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default AdminNavbar;
