import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

const KhojLogo = () => {
    return (
        <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex items-center gap-3 cursor-pointer"
        >
            {/* Animated Logo Icon */}
            <div className="relative w-10 h-10">
                {/* Outer rotating circle */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400 border-r-purple-400"
                />
                
                {/* Inner pulsing circle */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-60"
                />
                
                {/* Center dot */}
                <div className="absolute inset-3 rounded-full bg-white opacity-90" />
                
                {/* Glow effect */}
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-blue-400 blur-lg opacity-30"
                />
            </div>

            {/* Text Logo */}
            <div className="flex flex-col">
                <span className="text-lg font-black bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent leading-none">
                    KHOJ
                </span>
                <span className="text-[10px] font-bold text-blue-400 tracking-wider">SEARCH</span>
            </div>
        </motion.div>
    );
};

const HomeNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const navLinks = [
        { label: 'Home', path: '/' },
        { label: 'About Us', path: '/about' },
        { label: 'Login', path: '/login' },
        { label: 'Registration', path: '/register' }
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
                            <Link
                                key={link.path}
                                to={link.path}
                                className="text-gray-300 hover:text-white font-medium transition duration-200 relative group"
                            >
                                {link.label}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
                            </Link>
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
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className="text-gray-300 hover:text-white font-medium transition duration-200 block py-2"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default HomeNavbar;
