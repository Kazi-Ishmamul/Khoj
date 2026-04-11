import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaSearch, FaUserShield } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

interface UserData {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    role: string;
    pic_url: string;
    info?: {
        items_lost_count: number;
        items_found_count: number;
        report_strikes: number;
    };
}

const mkAvatar = (name: string) =>
    `https://ui-avatars.com/api/?background=6366f1&color=fff&size=200&name=${encodeURIComponent(name || 'User')}`;

const AllUsers = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get('http://localhost:8000/api/users', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(data.users);
            } catch (error) {
                console.error("Failed to fetch users", error);
                toast.error("Failed to load users");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter((u) => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.includes(searchTerm)
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-sky-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 font-sans text-slate-100 p-4 sm:p-8">
            <Toaster position="top-center" />
            
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/70 p-6 rounded-3xl shadow-xl border border-slate-700/60 backdrop-blur-sm">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
                                <FaUserShield />
                            </div>
                            <h1 className="text-2xl font-extrabold text-white">Manage Users</h1>
                        </div>
                        <p className="text-slate-300 text-sm mt-2">View all registered users and monitor account details.</p>
                    </div>
                    <div className="relative w-full sm:w-80">
                        <FaSearch className="absolute top-[14px] left-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl font-medium outline-none bg-slate-800/70 border border-slate-600 focus:border-sky-400 text-slate-100 transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredUsers.map(u => {
                        const isDefaultPic = !u.pic_url || u.pic_url === 'assets/profile_pictures/default_profile_pic.png';
                        const avatarUrl = isDefaultPic 
                            ? mkAvatar(u.name) 
                            : (u.pic_url.startsWith('http') ? u.pic_url : `http://localhost:8000/${u.pic_url}`);

                        return (
                            <div key={u.id} className="bg-slate-900/70 rounded-3xl p-6 shadow-xl border border-slate-700/60 flex flex-col items-center text-center hover:border-slate-500 transition-all duration-300 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 transition-opacity group-hover:opacity-70" />
                                
                                <img 
                                    src={avatarUrl} 
                                    alt={u.name} 
                                    onError={e => { (e.target as HTMLImageElement).src = mkAvatar(u.name); }}
                                    className="w-20 h-20 rounded-full border-4 border-slate-800 shadow-md z-10 relative mb-4 object-cover"
                                />
                                
                                <h3 className="font-bold text-lg text-slate-100 z-10">{u.name}</h3>
                                <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full mb-4 z-10 border ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border-purple-400/30' : 'bg-sky-500/20 text-sky-300 border-sky-400/30'}`}>
                                    {u.role}
                                </span>

                                <div className="w-full space-y-3 z-10 text-left mt-2 border-t border-slate-700 pt-4">
                                    <div className="flex items-center gap-3 text-sm text-slate-300">
                                        <FaEnvelope className="text-sky-400" />
                                        <span className="truncate">{u.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-300">
                                        <FaPhoneAlt className="text-sky-400" />
                                        <span>{u.phone || '—'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-300">
                                        <FaMapMarkerAlt className="text-sky-400" />
                                        <span className="truncate">{u.address || '—'}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-20 text-slate-300 font-medium bg-slate-900/50 rounded-2xl border border-slate-700/50">
                        No users found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllUsers;
