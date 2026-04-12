import { Link, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { FaBars, FaTimes, FaHome, FaInfoCircle, FaSignInAlt, FaUserPlus, FaSun, FaMoon } from 'react-icons/fa';
import KhojLogo from './KhojLogo';
import { useI18n } from '../i18n/I18nContext';
import { LanguageSwitcher } from './LanguageSwitcher';

type HomeNavbarProps = {
    isHomePage: boolean;
    homeIsDark: boolean;
    onToggleHomeTheme: () => void;
};

const HomeNavbar = ({ isHomePage, homeIsDark, onToggleHomeTheme }: HomeNavbarProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { t } = useI18n();

    const navLinks = useMemo(
        () => [
            { labelKey: 'nav.home' as const, path: '/', icon: <FaHome /> },
            { labelKey: 'nav.about' as const, path: '/about', icon: <FaInfoCircle /> },
        ],
        []
    );

    const ctaLinks = useMemo(
        () => [
            { labelKey: 'nav.login' as const, path: '/login', icon: <FaSignInAlt /> },
            { labelKey: 'nav.register' as const, path: '/register', icon: <FaUserPlus /> },
        ],
        []
    );

    const lightHome = isHomePage && !homeIsDark;

    const navShell =
        'sticky top-0 z-50 border-b backdrop-blur-2xl transition-[background-color,border-color,box-shadow] duration-300';
    const navClass = lightHome
        ? `${navShell} border-slate-200/90 bg-white/90 shadow-sm shadow-slate-200/50`
        : `${navShell} border-slate-700/60 bg-slate-950/95 shadow-xl shadow-black/30`;

    const linkMuted = lightHome
        ? 'text-slate-600 hover:text-slate-900'
        : 'text-slate-400 hover:text-white';
    const iconMuted = lightHome ? 'text-slate-500' : 'text-slate-500';
    const dividerClass = lightHome ? 'bg-slate-200/80' : 'bg-slate-700/60';

    const loginBtn = lightHome
        ? 'text-slate-700 border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50'
        : 'text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white hover:bg-slate-800/60';

    const mobilePanel = lightHome
        ? 'border-slate-200/80 bg-white/95'
        : 'border-slate-700/60 bg-slate-900/90';

    const themeBtn = lightHome
        ? 'border-slate-200 bg-white text-amber-600 hover:bg-slate-50 hover:border-slate-300'
        : 'border-slate-700 bg-slate-900 text-amber-300 hover:bg-slate-800 hover:text-amber-200';

    return (
        <nav className={navClass}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 no-underline" style={{ textDecoration: 'none' }}>
                        <KhojLogo />
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        <div className="flex items-center gap-1 mr-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 no-underline ${linkMuted} ${location.pathname === link.path ? (lightHome ? 'text-slate-900 bg-slate-100' : 'text-white bg-slate-800/50') : ''}`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <span className={`text-base ${iconMuted}`}>{link.icon}</span>
                                    {t(link.labelKey)}
                                </Link>
                            ))}
                        </div>

                        <div className="mr-2">
                            <LanguageSwitcher
                                id="nav-locale"
                                selectClassName={`h-10 cursor-pointer rounded-xl border px-2.5 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-violet-500/50 ${
                                    lightHome
                                        ? 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                                        : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-600'
                                }`}
                            />
                        </div>

                        {isHomePage && (
                            <button
                                type="button"
                                onClick={onToggleHomeTheme}
                                className={`mr-2 flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 ${themeBtn}`}
                                aria-label={homeIsDark ? 'Switch to light mode' : 'Switch to dark mode'}
                                title={homeIsDark ? 'Light mode' : 'Dark mode'}
                            >
                                {homeIsDark ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
                            </button>
                        )}

                        <div className={`h-6 w-px ${dividerClass} mr-3`} />

                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold border transition-all duration-200 no-underline ${loginBtn}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <FaSignInAlt className={`text-base ${iconMuted}`} />
                                {t('nav.login')}
                            </Link>
                            <Link
                                to="/register"
                                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-900/30 transition-all duration-200 no-underline"
                                style={{ textDecoration: 'none' }}
                            >
                                <FaUserPlus className="text-base text-blue-200" />
                                {t('nav.register')}
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:hidden">
                        <LanguageSwitcher
                            id="nav-locale-mobile"
                            selectClassName={`h-10 max-w-[4.5rem] cursor-pointer rounded-xl border px-1.5 text-xs font-semibold outline-none ${
                                lightHome
                                    ? 'border-slate-200 bg-white text-slate-800'
                                    : 'border-slate-700 bg-slate-900 text-slate-200'
                            }`}
                        />
                        {isHomePage && (
                            <button
                                type="button"
                                onClick={onToggleHomeTheme}
                                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 focus:outline-none ${themeBtn}`}
                                aria-label={homeIsDark ? 'Switch to light mode' : 'Switch to dark mode'}
                            >
                                {homeIsDark ? <FaSun className="text-base" /> : <FaMoon className="text-base" />}
                            </button>
                        )}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`flex items-center justify-center rounded-xl border p-2.5 transition-all duration-200 focus:outline-none md:hidden ${lightHome ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50' : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'}`}
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <FaTimes className="text-base" /> : <FaBars className="text-base" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
                        isOpen ? 'max-h-[28rem] opacity-100 pb-4' : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className={`flex flex-col gap-1 rounded-2xl border p-2 backdrop-blur-sm mt-2 ${mobilePanel}`}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 no-underline ${linkMuted}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <span className={`text-base ${iconMuted}`}>{link.icon}</span>
                                {t(link.labelKey)}
                            </Link>
                        ))}
                        <div className={`my-1 h-px ${dividerClass}`} />
                        {ctaLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 no-underline ${
                                    link.path === '/register'
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                        : lightHome
                                          ? 'text-slate-700 border border-slate-200 hover:bg-slate-50'
                                          : 'text-slate-300 border border-slate-700 hover:bg-slate-800/60 hover:text-white'
                                }`}
                                style={{ textDecoration: 'none' }}
                            >
                                <span className="text-base opacity-80">{link.icon}</span>
                                {t(link.labelKey)}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default HomeNavbar;
