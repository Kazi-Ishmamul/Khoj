import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import KhojLogo from './KhojLogo';
import { clearAuthStorage } from '../helpers/auth';

const AdminNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleLogout = () => {
        clearAuthStorage();
        navigate('/');
    };

    const navLinks = [
        { label: 'Manage Users', path: '/admin-dashboard/users' },
        { label: 'Manage Posts', path: '/admin-dashboard/posts' },
        { label: 'Reports', path: '/admin-dashboard/reports' },
        { label: 'Profile', path: '/admin-dashboard/profile' },
        { label: 'Logout', path: '/' }
    ];

    return (
        <nav className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-gray-700/50 sticky top-0 z-50 backdrop-blur">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="hover:opacity-80 transition">
                        <KhojLogo />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex gap-8">
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
                                    {link.label}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
                                </Link>
                            )
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden text-white text-2xl focus:outline-none"
                    >
                        {isOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>

                {/* Mobile Menu */}
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
                                    {link.label}
                                </Link>
                            )
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default AdminNavbar;
