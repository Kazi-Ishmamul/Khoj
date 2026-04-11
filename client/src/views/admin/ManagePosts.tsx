import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface User {
    id: number;
    name: string;
    email?: string;
    pic_url?: string;
}

interface Item {
    id: number;
    user_id: number;
    item_name: string;
    category?: string;
    description: string;
    date_time: string;
    location: string;
    status: 'lost' | 'found';
    contact_info: string;
    item_image_url?: string;
    resolution_status: 'not_claimed' | 'claimed' | 'resolved';
    valid: number;
    created_at: string;
    user?: User;
}

export default function ManagePosts() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [strikingItemId, setStrikingItemId] = useState<number | null>(null);
    const [confirmItem, setConfirmItem] = useState<Item | null>(null);

    const token = localStorage.getItem('token');

    const authHeaders = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
    };

    const fetchActivePosts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get<{ success: boolean; items: Item[] }>(
                'http://localhost:8000/api/admin/items/active',
                { headers: authHeaders }
            );

            if (response.data.success) {
                setItems(response.data.items || []);
            } else {
                setItems([]);
            }
        } catch {
            toast.error('Failed to load active posts');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActivePosts();
    }, [fetchActivePosts]);

    const strikePost = async (item: Item) => {
        try {
            setStrikingItemId(item.id);
            const response = await axios.post(
                `http://localhost:8000/api/admin/items/${item.id}/strike`,
                {},
                { headers: authHeaders }
            );

            if (response.data?.success) {
                toast.success('Post struck successfully');
                setItems((prev) => prev.filter((post) => post.id !== item.id));
                setConfirmItem(null);
                return;
            }

            toast.error(response.data?.message || 'Failed to strike post');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to strike post');
        } finally {
            setStrikingItemId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 py-10 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Manage Posts</h1>
                        <p className="text-slate-300 mt-2 max-w-2xl">
                            Review all active unresolved posts. Strike any post that appears fake to remove it from public listings.
                        </p>
                    </div>
                    <button
                        onClick={fetchActivePosts}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 rounded-xl font-semibold transition-colors"
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-72 rounded-2xl bg-slate-800/60 border border-slate-700/50 animate-pulse" />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-16 text-center">
                        <div className="text-5xl mb-4">✅</div>
                        <p className="text-2xl font-bold text-slate-100">No active posts found</p>
                        <p className="text-slate-400 mt-2">All posts are currently resolved or already removed.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {items.map((item) => {
                            const isStriking = strikingItemId === item.id;

                            return (
                                <article
                                    key={item.id}
                                    className="bg-slate-900/70 border border-slate-700/70 rounded-2xl overflow-hidden shadow-xl hover:border-slate-500/80 transition-all duration-300 backdrop-blur-sm"
                                >
                                    <div className="relative h-52 bg-slate-700">
                                        <img
                                            src={item.item_image_url || 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400'}
                                            alt={item.item_name}
                                            className="w-full h-full object-cover"
                                        />
                                        <span
                                            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold border ${item.status === 'lost'
                                                ? 'bg-rose-500/90 text-white border-rose-400/60'
                                                : 'bg-emerald-500/90 text-white border-emerald-400/60'
                                                }`}
                                        >
                                            {item.status === 'lost' ? 'LOST' : 'FOUND'}
                                        </span>
                                    </div>

                                    <div className="p-5">
                                        <h2 className="text-xl font-extrabold text-white line-clamp-2">{item.item_name}</h2>
                                        <p className="text-sm text-sky-300 mt-1 capitalize">{item.category || 'Uncategorized'}</p>

                                        <p className="text-sm text-slate-300 mt-4 line-clamp-3">{item.description}</p>

                                        <div className="grid grid-cols-2 gap-2 text-xs mt-4 text-slate-300">
                                            <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700">
                                                <p className="text-slate-400 mb-1">Location</p>
                                                <p className="font-semibold line-clamp-1">{item.location}</p>
                                            </div>
                                            <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700">
                                                <p className="text-slate-400 mb-1">Date</p>
                                                <p className="font-semibold">{new Date(item.date_time).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mt-4">
                                            <img
                                                src={item.user?.pic_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user?.name || 'User')}&background=334155&color=fff&size=40`}
                                                alt={item.user?.name || 'User'}
                                                className="w-9 h-9 rounded-full border border-slate-600"
                                            />
                                            <div>
                                                <p className="text-xs text-slate-400">Posted by</p>
                                                <p className="text-sm text-slate-200 font-semibold">{item.user?.name || 'Unknown User'}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setConfirmItem(item)}
                                            disabled={isStriking}
                                            className="mt-5 w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {isStriking ? 'Striking...' : 'Strike'}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

            {confirmItem && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        onClick={() => setConfirmItem(null)}
                    />
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6">
                            <h3 className="text-2xl font-black text-white">Confirm Strike</h3>
                            <p className="text-slate-300 mt-3 leading-relaxed">
                                You are about to strike
                                <span className="font-bold text-rose-300"> {confirmItem.item_name}</span>.
                                
                            </p>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setConfirmItem(null)}
                                    className="px-5 py-2.5 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => strikePost(confirmItem)}
                                    disabled={strikingItemId === confirmItem.id}
                                    className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors disabled:opacity-60"
                                >
                                    {strikingItemId === confirmItem.id ? 'Processing...' : 'Strike Post'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
