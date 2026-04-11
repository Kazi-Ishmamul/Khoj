import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaBars, FaTimes, FaHome, FaInfoCircle, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import KhojLogo from './KhojLogo';

const navLinks = [
    { label: 'Home', path: '/', icon: <FaHome /> },
    { label: 'About Us', path: '/about', icon: <FaInfoCircle /> },
];

const ctaLinks = [
    { label: 'Login', path: '/login', icon: <FaSignInAlt /> },
    { label: 'Register', path: '/register', icon: <FaUserPlus /> },
];

const HomeNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav
            className="sticky top-0 z-50 border-b border-slate-700/60 bg-slate-950/95 shadow-xl shadow-black/30 backdrop-blur-2xl"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 no-underline" style={{ textDecoration: 'none' }}>
                        <KhojLogo />
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {/* Regular links */}
                        <div className="flex items-center gap-1 mr-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 no-underline text-slate-400 hover:text-white"
                                    style={{ textDecoration: 'none' }}
                                >
                                    <span className="text-base text-slate-500">{link.icon}</span>
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="h-6 w-px bg-slate-700/60 mr-3" />

                        {/* CTA Links */}
                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-white hover:bg-slate-800/60 transition-all duration-200 no-underline"
                                style={{ textDecoration: 'none' }}
                            >
                                <FaSignInAlt className="text-base text-slate-500" />
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-900/30 transition-all duration-200 no-underline"
                                style={{ textDecoration: 'none' }}
                            >
                                <FaUserPlus className="text-base text-blue-200" />
                                Register
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200 focus:outline-none"
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <FaTimes className="text-base" /> : <FaBars className="text-base" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
                        isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className="flex flex-col gap-1 rounded-2xl border border-slate-700/60 bg-slate-900/90 p-2 backdrop-blur-sm mt-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 no-underline text-slate-400 hover:text-white"
                                style={{ textDecoration: 'none' }}
                            >
                                <span className="text-base text-slate-500">{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                        <div className="my-1 h-px bg-slate-700/60" />
                        {ctaLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 no-underline ${
                                    link.label === 'Register'
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                        : 'text-slate-300 border border-slate-700 hover:bg-slate-800/60 hover:text-white'
                                }`}
                                style={{ textDecoration: 'none' }}
                            >
                                <span className="text-base opacity-80">{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default HomeNavbar;
