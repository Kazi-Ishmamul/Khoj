import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { FaBars, FaTimes, FaBell } from 'react-icons/fa';
import axios from 'axios';
import KhojLogo from './KhojLogo';

interface UserData {
    name: string;
    profilePic: string;
}

const mkAvatar = (name: string) =>
    `https://ui-avatars.com/api/?background=6366f1&color=fff&size=200&name=${encodeURIComponent(name || 'User')}`;

const UserNavbar = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userData, setUserData] = useState<UserData>({ name: 'User', profilePic: mkAvatar('User') });
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Center navigation links
    const navLinks = [
        { label: 'Items', path: '/user-dashboard/items' },
        { label: 'My Activity', path: '/user-dashboard/activity' }
    ];

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const { data } = await axios.get('http://localhost:8000/api/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const user = data.user;
                const isDefaultPic = !user.pic_url ||
                    user.pic_url === 'assets/profile_pictures/default_profile_pic.png';
                const pic = isDefaultPic
                    ? mkAvatar(user.name)
                    : (user.pic_url.startsWith('http') ? user.pic_url : `http://localhost:8000/${user.pic_url}`);

                setUserData({
                    name: user.name || 'User',
                    profilePic: pic
                });
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <nav className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-gray-700/50 sticky top-0 z-50 backdrop-blur">
            <div className="max-w-7xl mx-auto px-4 py-3.5">
                <div className="flex justify-between items-center gap-4">
                    {/* Left: Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/user-dashboard/items" className="hover:opacity-80 transition duration-200">
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

                    {/* Right: Icons & Profile */}
                    <div className="flex items-center gap-4 md:gap-6">
                        {/* Notification Bell */}
                        <Link
                            to="/user-dashboard/notifications"
                            className="text-gray-300 hover:text-white transition duration-200 relative group"
                            title="Notifications"
                        >
                            <FaBell size={20} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </Link>

                        {/* Profile Picture Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-indigo-400 hover:border-indigo-300 transition duration-200 overflow-hidden hover:shadow-lg hover:shadow-indigo-500/50"
                                title="Profile menu"
                            >
                                <img
                                    src={userData.profilePic}
                                    alt={userData.name}
                                    className="w-full h-full object-cover"
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-gray-700 bg-slate-900/50">
                                        <p className="text-white font-semibold text-sm truncate">{userData.name}</p>
                                        <p className="text-gray-400 text-xs">Profile</p>
                                    </div>

                                    {/* Menu Items */}
                                    <Link
                                        to="/user-dashboard/profile"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-slate-700 transition duration-150 text-sm font-medium"
                                    >
                                        👤 View Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            handleLogout();
                                        }}
                                        className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-red-600/20 transition duration-150 text-sm font-medium border-t border-gray-700"
                                    >
                                        🚪 Logout
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleMenu}
                            className="md:hidden text-white text-2xl focus:outline-none hover:text-gray-300 transition"
                        >
                            {isOpen ? <FaTimes /> : <FaBars />}
                        </button>
                    </div>
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
                    </div>
                )}
            </div>
        </nav>
    );
};

export default UserNavbar;
