import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
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
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 p-4 sm:p-8">
            <Toaster position="top-center" />
            
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800">All Database Users</h1>
                        <p className="text-slate-500 text-sm mt-1">Manage and view all registered users in the platform.</p>
                    </div>
                    <div className="relative w-full sm:w-80">
                        <FaSearch className="absolute top-[14px] left-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl font-medium outline-none bg-slate-50 border-2 border-indigo-100 focus:border-indigo-400 focus:bg-white text-slate-800 transition-all"
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
                            <div key={u.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 transition-opacity group-hover:opacity-40" />
                                
                                <img 
                                    src={avatarUrl} 
                                    alt={u.name} 
                                    onError={e => { (e.target as HTMLImageElement).src = mkAvatar(u.name); }}
                                    className="w-20 h-20 rounded-full border-4 border-white shadow-md z-10 relative mb-4 object-cover"
                                />
                                
                                <h3 className="font-bold text-lg text-slate-800 z-10">{u.name}</h3>
                                <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full mb-4 z-10 ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-50 text-indigo-700'}`}>
                                    {u.role}
                                </span>

                                <div className="w-full space-y-3 z-10 text-left mt-2 border-t border-slate-50 pt-4">
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <FaEnvelope className="text-indigo-400" />
                                        <span className="truncate">{u.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <FaPhoneAlt className="text-indigo-400" />
                                        <span>{u.phone || '—'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <FaMapMarkerAlt className="text-indigo-400" />
                                        <span className="truncate">{u.address || '—'}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-20 text-slate-500 font-medium">
                        No users found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllUsers;
