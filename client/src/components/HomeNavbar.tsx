import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import KhojLogo from './KhojLogo';

const HomeNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const navLinks = [
        { label: 'Home', path: '/' },
        { label: 'About Us', path: '/about' }
    ];

    const authLinks = [
        { label: 'Login', path: '/login' },
        { label: 'Register', path: '/register' }
    ];

    return (
        <nav className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-gray-700/50 sticky top-0 z-50 backdrop-blur">
            <div className="max-w-7xl mx-auto px-4 py-3.5">
                <div className="flex justify-between items-center gap-4">
                    {/* Left: Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="hover:opacity-80 transition duration-200">
                            <KhojLogo />
                        </Link>
                    </div>

                    {/* Center: Navigation (Desktop) */}
                    <div className="hidden md:flex flex-1 justify-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="text-gray-300 hover:text-white font-medium transition duration-200 relative group text-sm"
                            >
                                {link.label}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        ))}
                    </div>

                    {/* Right: Auth Links (Desktop) */}
                    <div className="hidden md:flex gap-4 flex-shrink-0">
                        {authLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                                    link.label === 'Register'
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                                        : 'text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden text-white text-2xl focus:outline-none hover:text-gray-300 transition"
                    >
                        {isOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden mt-4 flex flex-col gap-2 border-t border-gray-700/50 pt-4 pb-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className="text-gray-300 hover:text-white hover:bg-slate-700/50 font-medium transition duration-200 block px-3 py-2 rounded-md"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="border-t border-gray-700/50 my-2 pt-2">
                            {authLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`block px-3 py-2 rounded-md font-medium transition duration-200 ${
                                        link.label === 'Register'
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                                            : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default HomeNavbar;
