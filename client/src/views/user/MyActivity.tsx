import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface UserInfo {
    bio?: string | null;
    fb_url?: string | null;
    x_url?: string | null;
    insta_url?: string | null;
    linkedin_url?: string | null;
}

interface User {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    pic_url?: string;
    info?: UserInfo | null;
}

interface Item {
    id: number;
    user_id: number;
    item_name: string;
    category: string;
    description: string;
    date_time: string;
    location: string;
    status: 'lost' | 'found';
    contact_info: string;
    item_image_url?: string;
    resolution_status: 'not_claimed' | 'claimed' | 'resolved';
    valid: number;
    user?: User;
    claims?: Claim[];
    claimedByUser?: User;
}

interface Claim {
    claim_id: number;
    item_id: number;
    claimed_by_id: number;
    validity: number;
    created_at?: string;
    claimedBy?: User;
    claimed_by?: User;
}

interface ActivityData {
    lost_items: { count: number; items: Item[] };
    found_items: { count: number; items: Item[] };
    claim_requests: { count: number; items: Item[] };
    claims_received: { count: number; items: Item[] };
    resolved: { count: number; items: Item[] };
}

interface EditReportForm {
    item_name: string;
    category: string;
    description: string;
    date_time: string;
    location: string;
    contact_info: string;
    item_image_url: string;
}

type TabType = 'lost_items' | 'found_items' | 'claim_requests' | 'claims_received' | 'resolved';

const ITEMS_PER_PAGE = 12;

const TAB_QUERY_VALUES: TabType[] = ['lost_items', 'found_items', 'claim_requests', 'claims_received', 'resolved'];

export default function MyActivity() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<TabType>('lost_items');
    const [currentPage, setCurrentPage] = useState(1);
    const [activityData, setActivityData] = useState<ActivityData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [editSaving, setEditSaving] = useState(false);
    const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const [editForm, setEditForm] = useState<EditReportForm>({
        item_name: '',
        category: '',
        description: '',
        date_time: '',
        location: '',
        contact_info: '',
        item_image_url: ''
    });

    const fetchActivityData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please login to view your activity');
                setActivityData(null);
                return;
            }

            const response = await axios.get('http://localhost:8000/api/my-activity', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            setActivityData(response.data.data);
            setError(null);
        } catch (err) {
            console.error('Activity fetch error:', err);
            let errorMsg = 'Failed to load activity';

            if (axios.isAxiosError(err)) {
                if (err.response?.status === 401) {
                    errorMsg = 'Unauthorized - Please login again';
                    localStorage.removeItem('token');
                } else {
                    errorMsg = err.response?.data?.message || err.message || 'Failed to load activity';
                }
            } else if (err instanceof Error) {
                errorMsg = err.message;
            }

            setError(errorMsg);
            setActivityData(null);
        } finally {
            setLoading(false);
        }
    };
    // Fetch activity data on component mount
    useEffect(() => {
        fetchActivityData();
    }, []);

    useEffect(() => {
        const t = searchParams.get('tab');
        if (!t || !TAB_QUERY_VALUES.includes(t as TabType)) return;
        setActiveTab(t as TabType);
        const next = new URLSearchParams(searchParams);
        next.delete('tab');
        setSearchParams(next, { replace: true });
    }, [searchParams, setSearchParams]);

    const handleAcceptClaim = async (claimId: number) => {
        try {
            setActionLoading(claimId);
            const token = localStorage.getItem('token');

            await axios.post(`http://localhost:8000/api/claims/${claimId}/accept`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            await fetchActivityData();
        } catch (err) {
            console.error('Error accepting claim:', err);
            toast.error('Failed to accept claim');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeclineClaim = async (claimId: number) => {
        try {
            setActionLoading(claimId);
            const token = localStorage.getItem('token');

            await axios.post(`http://localhost:8000/api/claims/${claimId}/decline`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            await fetchActivityData();
        } catch (err) {
            console.error('Error declining claim:', err);
            toast.error('Failed to decline claim');
        } finally {
            setActionLoading(null);
        }
    };

    const openEditModal = (item: Item) => {
        setEditingItem(item);
        setEditForm({
            item_name: item.item_name || '',
            category: item.category || '',
            description: item.description || '',
            date_time: item.date_time ? item.date_time.slice(0, 16) : '',
            location: item.location || '',
            contact_info: item.contact_info || '',
            item_image_url: item.item_image_url || ''
        });
        setImageFile(null);
        setImagePreview(null);
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingItem(null);
        setEditSaving(false);
        setImageFile(null);
        setImagePreview(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleEditInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateItem = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingItem) return;

        try {
            setEditSaving(true);
            let finalImageUrl = editForm.item_image_url;

            // Upload image to Cloudinary if a new file is selected
            if (imageFile) {
                const uploadData = new FormData();
                uploadData.append('file', imageFile);
                uploadData.append('upload_preset', 'khoj-items');

                try {
                    const cloudinaryRes = await axios.post('https://api.cloudinary.com/v1_1/dait0sacc/image/upload', uploadData);
                    finalImageUrl = cloudinaryRes.data.secure_url;
                } catch (uploadErr) {
                    console.error('Cloudinary upload error:', uploadErr);
                    toast.error('Failed to upload image');
                    setEditSaving(false);
                    return;
                }
            }

            const token = localStorage.getItem('token');

            await axios.put(
                `http://localhost:8000/api/items/${editingItem.id}`,
                {
                    ...editForm,
                    item_image_url: finalImageUrl
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );

            await fetchActivityData();
            closeEditModal();
            toast.success('Item updated successfully');
        } catch (err) {
            console.error('Error updating item:', err);
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.message || 'Failed to update report'
                : 'Failed to update report';
            toast.error(msg);
        } finally {
            setEditSaving(false);
        }
    };

    const handleDeleteItem = async (itemId: number) => {
        const confirmed = window.confirm('Are you sure you want to delete this report?');
        if (!confirmed) return;

        try {
            setDeletingItemId(itemId);
            const token = localStorage.getItem('token');

            await axios.delete(`http://localhost:8000/api/items/${itemId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            toast.success('Item deleted successfully');
            await fetchActivityData();
        } catch (err) {
            console.error('Error deleting item:', err);
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.message || 'Failed to delete report'
                : 'Failed to delete report';
            toast.error(msg);
        } finally {
            setDeletingItemId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 py-10 text-slate-100">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center py-16 bg-slate-900/80 rounded-3xl shadow-sm border border-slate-700/60">
                        <p className="text-xl text-slate-300">Loading your activity...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !activityData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 py-10 text-slate-100">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center py-16 bg-slate-900/80 rounded-3xl shadow-sm border border-slate-700/60">
                        <p className="text-xl text-rose-300 font-semibold">Error</p>
                        <p className="text-slate-300 mt-2">{error || 'Failed to load activity data'}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Get current tab items and filter by search
    const claimsReceivedCards: Item[] = activityData.claims_received.items.flatMap((item) => {
        const pendingClaims = (item.claims || []).filter((claim) => claim.validity === 0);

        return pendingClaims.map((claim) => {
            const claimer = claim.claimedBy || claim.claimed_by;
            return {
                ...item,
                claims: [claim],
                claimedByUser: claimer
            };
        });
    });

    const tabsConfig: Record<TabType, { label: string; icon: string; color: string; data: Item[] }> = {
        lost_items: {
            label: 'Lost Items',
            icon: '🔴',
            color: 'red',
            data: activityData.lost_items.items.filter(item => item.valid === 1 && item.resolution_status !== 'resolved')
        },
        found_items: {
            label: 'Found Items',
            icon: '🟢',
            color: 'green',
            data: activityData.found_items.items.filter(item => item.valid === 1 && item.resolution_status !== 'resolved')
        },
        claim_requests: {
            label: 'Claim Requests',
            icon: '🔵',
            color: 'blue',
            data: activityData.claim_requests.items
        },
        claims_received: {
            label: 'Claims Received',
            icon: '🟡',
            color: 'yellow',
            data: claimsReceivedCards
        },
        resolved: {
            label: 'Resolved',
            icon: '✅',
            color: 'teal',
            data: activityData.resolved.items
        }
    };

    const currentTabData = tabsConfig[activeTab].data;
    const filteredItems = currentTabData;

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 py-10 text-slate-100 relative">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-8rem] left-[-6rem] h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
                <div className="absolute bottom-[-8rem] right-[-6rem] h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
            </div>
            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-sky-300 mb-2">My Activity</h1>
                    <p className="text-slate-400">Track all your lost & found items, claims, and resolutions</p>
                </div>

                {/* Tabs with Counts */}
                <div className="bg-slate-900/80 rounded-2xl shadow-sm border border-slate-700/70 mb-8 overflow-x-auto backdrop-blur-xl">
                    <div className="flex">
                        {(Object.entries(tabsConfig) as Array<[TabType, typeof tabsConfig[TabType]]>).map(([tabKey, tab]) => {
                    const count =
                            tabKey === 'claims_received'
                                ? tab.data.length
                                : activityData[tabKey]?.count ?? tab.data.length;
                            return (
                                <button
                                    key={tabKey}
                                    onClick={() => {
                                        setActiveTab(tabKey);
                                        setCurrentPage(1);
                                    }}
                                    className={`flex-1 min-w-max px-6 py-4 font-medium transition-all border-b-2 text-center ${
                                        activeTab === tabKey
                                            ? `border-${tab.color}-500 text-${tab.color}-300 bg-slate-800/80`
                                            : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                    }`}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    <span className="font-semibold">{tab.label}</span>
                                    <span className="ml-2 bg-slate-700 text-slate-100 px-2 py-0.5 rounded-full text-sm font-bold">
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Items Grid */}
                {paginatedItems.length === 0 ? (
                    <div className="text-center py-16 bg-slate-900/80 rounded-3xl shadow-sm border border-slate-700/60">
                        <p className="text-xl text-slate-300 mb-2">No items in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedItems.map(item => {
                            const claimCardId = activeTab === 'claims_received' && item.claims && item.claims.length > 0
                                ? `${item.id}-${item.claims[0].claim_id}`
                                : `${item.id}`;

                            return (
                            <div
                                key={claimCardId}
                                className="bg-slate-900/90 rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-slate-700/70 flex flex-col group backdrop-blur-sm"
                            >
                                {/* Image Container with Status Badge */}
                                <div className="relative overflow-hidden h-56 bg-gradient-to-br from-slate-800 to-slate-900">
                                    {item.item_image_url && (
                                        <img
                                            src={item.item_image_url}
                                            alt={item.item_name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    )}
                                    {/* Status Badge - Floating */}
                                    <span
                                        className={`absolute top-3 right-3 px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md ${
                                            item.status === 'lost'
                                                ? 'bg-red-500/90 text-white shadow-lg'
                                                : 'bg-green-500/90 text-white shadow-lg'
                                        }`}
                                    >
                                        {item.status === 'lost' ? '🔴 LOST' : '🟢 FOUND'}
                                    </span>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    {/* Item Title and Category */}
                                    <h3 className="text-2xl font-bold text-slate-100 mb-1 line-clamp-2">
                                        {item.item_name}
                                    </h3>
                                    <p className="text-sm font-semibold text-sky-300 mb-4 capitalize">
                                        {item.category || 'Uncategorized'}
                                    </p>

                                    {/* Description */}
                                    <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                                        {item.description}
                                    </p>

                                    {/* Item Poster Info */}
                                    {item.user && (
                                        <div className="bg-slate-800/70 rounded-2xl p-3 mb-4 border border-slate-700/60">
                                            <div
                                                className="flex items-center gap-3 cursor-pointer"
                                                onClick={() => {
                                                    setSelectedUser(item.user!);
                                                    setShowUserModal(true);
                                                }}
                                            >
                                                <img
                                                    src={item.user.pic_url || 'https://ui-avatars.com/api/?name=User&background=random'}
                                                    alt={item.user.name}
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 shadow-md hover:ring-2 hover:ring-sky-500 transition-all"
                                                />
                                                <div>
                                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Posted by</p>
                                                    <p className="text-sm font-bold text-slate-100 hover:text-sky-300 transition-colors">{item.user.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                                        <div className="bg-slate-800/60 rounded-xl p-2 border border-slate-700/60">
                                            <p className="text-slate-400 font-semibold mb-1">📍 Location</p>
                                            <p className="text-slate-100 font-medium line-clamp-1">{item.location}</p>
                                        </div>
                                        <div className="bg-slate-800/60 rounded-xl p-2 border border-slate-700/60">
                                            <p className="text-slate-400 font-semibold mb-1">📅 When</p>
                                            <p className="text-slate-100 font-medium">{new Date(item.date_time).toLocaleDateString()}</p>
                                        </div>
                                        <div className="bg-slate-800/60 rounded-xl p-2 col-span-2 border border-slate-700/60">
                                            <p className="text-slate-400 font-semibold mb-1">📞 Contact</p>
                                            <p className="text-slate-100 font-medium truncate">{item.contact_info}</p>
                                        </div>
                                    </div>

                                    {/* Claimer Info */}
                                    {item.claimedByUser && (activeTab === 'claim_requests' || activeTab === 'resolved') && (
                                        <div className="bg-slate-800/70 rounded-2xl p-3 mb-4 border border-slate-700/60">
                                            <div
                                                className="flex items-center gap-3 cursor-pointer"
                                                onClick={() => {
                                                    setSelectedUser(item.claimedByUser!);
                                                    setShowUserModal(true);
                                                }}
                                            >
                                                <img
                                                    src={item.claimedByUser.pic_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(item.claimedByUser.name) + '&background=random'}
                                                    alt={item.claimedByUser.name}
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 shadow-md hover:ring-2 hover:ring-sky-500 transition-all"
                                                />
                                                <div>
                                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                                                        {activeTab === 'claim_requests' ? '🙋 Your Claim' : '✓ Resolved with'}
                                                    </p>
                                                    <p className="text-sm font-bold text-slate-100 hover:text-sky-300 transition-colors">{item.claimedByUser.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'claims_received' && item.claims && item.claims.length > 0 && (
                                        <div className="space-y-2 mb-4">
                                            {item.claims.map((claim) => (
                                                (() => {
                                                    const claimer = claim.claimedBy || claim.claimed_by;
                                                    return (
                                                <div key={claim.claim_id} className="bg-slate-800/70 rounded-2xl p-3 border border-slate-700/60">
                                                    <div
                                                        className="flex items-center gap-3 cursor-pointer"
                                                        onClick={() => {
                                                            if (!claimer) return;
                                                            setSelectedUser(claimer);
                                                            setShowUserModal(true);
                                                        }}
                                                    >
                                                        <img
                                                            src={claimer?.pic_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(claimer?.name || 'User') + '&background=random'}
                                                            alt={claimer?.name || 'User'}
                                                            className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 shadow-md hover:ring-2 hover:ring-sky-500 transition-all"
                                                        />
                                                        <div>
                                                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">👤 Claimed by</p>
                                                            <p className="text-sm font-bold text-slate-100 hover:text-sky-300 transition-colors">{claimer?.name || 'Unknown User'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                    );
                                                })()
                                            ))}
                                        </div>
                                    )}

                                    {/* Resolution Status */}
                                    <div className="mt-auto">
                                        {(activeTab === 'lost_items' || activeTab === 'found_items') && (
                                            <div className="mb-4 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(item)}
                                                    className="flex-1 px-3 py-2 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/30 hover:bg-sky-500/25 font-semibold text-sm transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    disabled={deletingItemId === item.id}
                                                    className="flex-1 px-3 py-2 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 font-semibold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {deletingItemId === item.id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </div>
                                        )}

                                        {activeTab !== 'claims_received' && (
                                            <span
                                                className={`inline-block px-4 py-2 rounded-full text-xs font-bold mb-3 ${
                                                    item.resolution_status === 'resolved'
                                                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                                        : item.resolution_status === 'claimed'
                                                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                                            : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                                                }`}
                                            >
                                                {item.resolution_status === 'resolved'
                                                    ? '✅ Resolved'
                                                    : item.resolution_status === 'claimed'
                                                        ? '⏳ Pending Review'
                                                        : '⭕ Not Claimed'}
                                            </span>
                                        )}

                                        {/* Accept/Decline buttons for Claims Received */}
                                        {activeTab === 'claims_received' && item.claims && item.claims.length > 0 && (
                                            <div className="space-y-2">
                                                {item.claims.map((claim) => (
                                                    <div key={claim.claim_id} className="flex gap-2">
                                                        <button
                                                            onClick={() => handleAcceptClaim(claim.claim_id)}
                                                            disabled={actionLoading === claim.claim_id}
                                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-100 shadow-md hover:shadow-lg"
                                                        >
                                                            {actionLoading === claim.claim_id ? '⏳ Processing...' : '✓ Accept'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeclineClaim(claim.claim_id)}
                                                            disabled={actionLoading === claim.claim_id}
                                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-100 shadow-md hover:shadow-lg"
                                                        >
                                                            {actionLoading === claim.claim_id ? '⏳ Processing...' : '✕ Decline'}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-12">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-5 py-2 bg-slate-900/80 text-slate-100 border border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 font-medium"
                        >
                            Previous
                        </button>
                        <span className="text-slate-300 font-medium">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-5 py-2 bg-slate-900/80 text-slate-100 border border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 font-medium"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* User Profile Modal */}
            {showUserModal && selectedUser && (
                <>
                    <div
                        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-[9998]"
                        onClick={() => setShowUserModal(false)}
                    />
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <div className="bg-slate-900 rounded-3xl shadow-2xl ring-1 ring-slate-700/70 w-full max-w-sm overflow-hidden text-slate-100">

                            {/* Modal Header Banner */}
                            <div className="relative bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 h-28 flex-shrink-0">
                                <button
                                    onClick={() => setShowUserModal(false)}
                                    aria-label="Close"
                                    className="absolute top-3 right-3 w-9 h-9 bg-slate-100 rounded-full shadow-lg flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-150"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"/>
                                        <line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                </button>
                            </div>

                            <div className="px-7 pb-7">
                                {/* Profile Picture - overlapping banner */}
                                <div className="flex flex-col items-center -mt-12 mb-4 relative z-10">
                                    <img
                                        src={selectedUser.pic_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedUser.name) + '&background=4F46E5&color=fff&size=150'}
                                        alt={selectedUser.name}
                                        className="w-24 h-24 rounded-full object-cover border-4 border-slate-800 shadow-xl bg-slate-800"
                                    />
                                    <h2 className="text-xl font-bold text-white text-center mt-3">{selectedUser.name}</h2>
                                    {selectedUser.info?.bio && (
                                        <div className="mt-3 px-2 text-center">
                                            <p className="text-sm text-slate-400 italic leading-relaxed">"{selectedUser.info.bio}"</p>
                                        </div>
                                    )}
                                </div>

                                {/* Contact Info */}
                                <div className="bg-slate-800/70 rounded-2xl p-4 mb-4 border border-slate-700/60 space-y-3">
                                    {selectedUser.email && (
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-sky-500/15 flex items-center justify-center text-sky-300 flex-shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                                </svg>
                                            </span>
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium">Email</p>
                                                <p className="text-sm font-semibold text-slate-100">{selectedUser.email}</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedUser.phone && (
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-300 flex-shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.61 5a2 2 0 0 1 1.98-2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.33v-.41z"/>
                                                </svg>
                                            </span>
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium">Phone</p>
                                                <p className="text-sm font-semibold text-slate-100">{selectedUser.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Social Media Icons */}
                                {selectedUser.info && (() => {
                                    const socials = [
                                        {
                                            key: 'fb',
                                            url: selectedUser.info!.fb_url,
                                            label: 'Facebook',
                                            color: 'hover:bg-blue-600',
                                            icon: (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                                                </svg>
                                            ),
                                        },
                                        {
                                            key: 'x',
                                            url: selectedUser.info!.x_url,
                                            label: 'X (Twitter)',
                                            color: 'hover:bg-black',
                                            icon: (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                                </svg>
                                            ),
                                        },
                                        {
                                            key: 'insta',
                                            url: selectedUser.info!.insta_url,
                                            label: 'Instagram',
                                            color: 'hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-500 hover:to-orange-400',
                                            icon: (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                                                </svg>
                                            ),
                                        },
                                        {
                                            key: 'linkedin',
                                            url: selectedUser.info!.linkedin_url,
                                            label: 'LinkedIn',
                                            color: 'hover:bg-blue-700',
                                            icon: (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                                                    <rect x="2" y="9" width="4" height="12"/>
                                                    <circle cx="4" cy="4" r="2"/>
                                                </svg>
                                            ),
                                        },
                                    ].filter(s => s.url);

                                    return socials.length > 0 ? (
                                        <div className="mb-5">
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">Connect on Social</p>
                                            <div className="flex justify-center gap-3">
                                                {socials.map(social => (
                                                    <a
                                                        key={social.key}
                                                        href={social.url!}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title={social.label}
                                                        className={`w-11 h-11 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center transition-all duration-200 hover:text-white hover:scale-110 hover:shadow-lg ${social.color}`}
                                                    >
                                                        {social.icon}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        </div>
                    </div>
                </>
            )}


            {/* Edit Report Modal */}
            {showEditModal && editingItem && (
                <>
                    <div
                        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-[9998]"
                        onClick={closeEditModal}
                    />
                    <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto pt-20 md:pt-24">
                        <div className="bg-slate-900 rounded-3xl shadow-2xl ring-1 ring-slate-700/70 w-full max-w-2xl mx-4 my-8 max-h-[calc(100vh-10rem)] overflow-y-auto">
                            <div className="p-6 md:p-8 text-slate-100">
                                <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900 z-10 pb-2 border-b border-slate-700">
                                    <h2 className="text-2xl font-bold text-white">Edit Post</h2>
                                    <button
                                        type="button"
                                        onClick={closeEditModal}
                                        className="text-slate-300 hover:text-white text-3xl font-bold leading-none"
                                    >
                                        ×
                                    </button>
                                </div>

                                <form onSubmit={handleUpdateItem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Item Name *</label>
                                        <input
                                            type="text"
                                            name="item_name"
                                            value={editForm.item_name}
                                            onChange={handleEditInputChange}
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                                        <input
                                            type="text"
                                            name="category"
                                            value={editForm.category}
                                            onChange={handleEditInputChange}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
                                        <textarea
                                            name="description"
                                            value={editForm.description}
                                            onChange={handleEditInputChange}
                                            required
                                            rows={3}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Date & Time *</label>
                                        <input
                                            type="datetime-local"
                                            name="date_time"
                                            value={editForm.date_time}
                                            onChange={handleEditInputChange}
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Location *</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={editForm.location}
                                            onChange={handleEditInputChange}
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Contact Info *</label>
                                        <input
                                            type="text"
                                            name="contact_info"
                                            value={editForm.contact_info}
                                            onChange={handleEditInputChange}
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-300 mb-3">Item Image (optional)</label>
                                        <div className="flex items-center gap-4">
                                            {(imagePreview || editForm.item_image_url) && (
                                                <img
                                                    src={imagePreview || editForm.item_image_url}
                                                    alt="Preview"
                                                    className="w-20 h-20 rounded-lg object-cover border-2 border-slate-600"
                                                />
                                            )}
                                            <input
                                                ref={imageInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-sky-500/15 file:text-sky-200 hover:file:bg-sky-500/25"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 flex justify-end gap-4 mt-6">
                                        <button
                                            type="button"
                                            onClick={closeEditModal}
                                            className="px-6 py-2.5 bg-slate-800 text-slate-200 rounded-xl hover:bg-slate-700 transition-colors border border-slate-700"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={editSaving}
                                            className="px-8 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {editSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
