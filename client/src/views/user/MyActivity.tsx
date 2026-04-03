import { useState, useEffect } from 'react';
import axios from 'axios';

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
}

interface ActivityData {
    lost_items: { count: number; items: Item[] };
    found_items: { count: number; items: Item[] };
    claim_requests: { count: number; items: Item[] };
    claims_received: { count: number; items: Item[] };
    resolved: { count: number; items: Item[] };
}

type TabType = 'lost_items' | 'found_items' | 'claim_requests' | 'claims_received' | 'resolved';

const ITEMS_PER_PAGE = 12;

export default function MyActivity() {
    const [activeTab, setActiveTab] = useState<TabType>('lost_items');
    const [currentPage, setCurrentPage] = useState(1);
    const [activityData, setActivityData] = useState<ActivityData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showUserModal, setShowUserModal] = useState(false);

    // Fetch activity data on component mount
    useEffect(() => {
        const fetchActivity = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Please login to view your activity');
                    setLoading(false);
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

        fetchActivity();
    }, []);

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

            // Refresh activity data
            const response = await axios.get('http://localhost:8000/api/my-activity', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            setActivityData(response.data.data);
        } catch (err) {
            console.error('Error accepting claim:', err);
            alert('Failed to accept claim');
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

            // Refresh activity data
            const response = await axios.get('http://localhost:8000/api/my-activity', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            setActivityData(response.data.data);
        } catch (err) {
            console.error('Error declining claim:', err);
            alert('Failed to decline claim');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-10">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                        <p className="text-xl text-gray-500">Loading your activity...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !activityData) {
        return (
            <div className="min-h-screen bg-gray-50 py-10">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                        <p className="text-xl text-red-500 font-semibold">Error</p>
                        <p className="text-gray-600 mt-2">{error || 'Failed to load activity data'}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Get current tab items and filter by search
    const tabsConfig: Record<TabType, { label: string; icon: string; color: string; data: Item[] }> = {
        lost_items: {
            label: 'Lost Items',
            icon: '🔴',
            color: 'red',
            data: activityData.lost_items.items
        },
        found_items: {
            label: 'Found Items',
            icon: '🟢',
            color: 'green',
            data: activityData.found_items.items
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
            data: activityData.claims_received.items
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

    const getStatusBg = (status: string) => {
        return status === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">My Activity</h1>
                    <p className="text-gray-600">Track all your lost & found items, claims, and resolutions</p>
                </div>

                {/* Tabs with Counts */}
                <div className="bg-white rounded-lg shadow-sm border mb-8 overflow-x-auto">
                    <div className="flex">
                        {(Object.entries(tabsConfig) as Array<[TabType, typeof tabsConfig[TabType]]>).map(([tabKey, tab]) => {
                            const count = activityData[tabKey].count;
                            return (
                                <button
                                    key={tabKey}
                                    onClick={() => {
                                        setActiveTab(tabKey);
                                        setCurrentPage(1);
                                    }}
                                    className={`flex-1 min-w-max px-6 py-4 font-medium transition-all border-b-2 text-center ${
                                        activeTab === tabKey
                                            ? `border-${tab.color}-600 text-${tab.color}-600 bg-${tab.color}-50`
                                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    <span className="font-semibold">{tab.label}</span>
                                    <span className="ml-2 bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-sm font-bold">
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Items Grid */}
                {paginatedItems.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
                        <p className="text-xl text-gray-500 mb-2">No items in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedItems.map(item => (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col group"
                            >
                                {/* Image Container with Status Badge */}
                                <div className="relative overflow-hidden h-56 bg-gradient-to-br from-gray-100 to-gray-200">
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
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1 line-clamp-2">
                                        {item.item_name}
                                    </h3>
                                    <p className="text-sm font-semibold text-blue-600 mb-4 capitalize">
                                        {item.category || 'Uncategorized'}
                                    </p>

                                    {/* Description */}
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                                        {item.description}
                                    </p>

                                    {/* Item Poster Info */}
                                    {item.user && (
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-4 border border-blue-100">
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
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md hover:ring-2 hover:ring-blue-500 transition-all"
                                                />
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Posted by</p>
                                                    <p className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">{item.user.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                                        <div className="bg-gray-50 rounded-lg p-2">
                                            <p className="text-gray-500 font-semibold mb-1">📍 Location</p>
                                            <p className="text-gray-800 font-medium line-clamp-1">{item.location}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2">
                                            <p className="text-gray-500 font-semibold mb-1">📅 When</p>
                                            <p className="text-gray-800 font-medium">{new Date(item.date_time).toLocaleDateString()}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2 col-span-2">
                                            <p className="text-gray-500 font-semibold mb-1">📞 Contact</p>
                                            <p className="text-gray-800 font-medium truncate">{item.contact_info}</p>
                                        </div>
                                    </div>

                                    {/* Claimer Info */}
                                    {item.claimedByUser && (activeTab === 'claim_requests' || activeTab === 'claims_received' || activeTab === 'resolved') && (
                                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-4 border border-purple-200">
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
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md hover:ring-2 hover:ring-purple-500 transition-all"
                                                />
                                                <div>
                                                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">
                                                        {activeTab === 'claim_requests' ? '🙋 Your Claim' : activeTab === 'claims_received' ? '👤 Claimed by' : '✓ Resolved with'}
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-900 hover:text-purple-600 transition-colors">{item.claimedByUser.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Resolution Status */}
                                    <div className="mt-auto">
                                        {activeTab !== 'claims_received' && (
                                            <span
                                                className={`inline-block px-4 py-2 rounded-full text-xs font-bold mb-3 ${
                                                    item.resolution_status === 'resolved'
                                                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300'
                                                        : item.resolution_status === 'claimed'
                                                            ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-300'
                                                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
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
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAcceptClaim(item.claims![0].claim_id)}
                                                    disabled={actionLoading === item.claims![0].claim_id}
                                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-100 shadow-md hover:shadow-lg"
                                                >
                                                    {actionLoading === item.claims![0].claim_id ? '⏳ Processing...' : '✓ Accept'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeclineClaim(item.claims![0].claim_id)}
                                                    disabled={actionLoading === item.claims![0].claim_id}
                                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-100 shadow-md hover:shadow-lg"
                                                >
                                                    {actionLoading === item.claims![0].claim_id ? '⏳ Processing...' : '✕ Decline'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-12">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-5 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium"
                        >
                            Previous
                        </button>
                        <span className="text-gray-700 font-medium">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-5 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium"
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
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
                        onClick={() => setShowUserModal(false)}
                    />
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

                            {/* Modal Header Banner */}
                            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 h-28 flex-shrink-0">
                                <button
                                    onClick={() => setShowUserModal(false)}
                                    aria-label="Close"
                                    className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-150"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl bg-white"
                                    />
                                    <h2 className="text-xl font-bold text-gray-900 text-center mt-3">{selectedUser.name}</h2>
                                    {selectedUser.info?.bio && (
                                        <div className="mt-3 px-2 text-center">
                                            <p className="text-sm text-gray-600 italic leading-relaxed">"{selectedUser.info.bio}"</p>
                                        </div>
                                    )}
                                </div>

                                {/* Contact Info */}
                                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 mb-4 border border-blue-100 space-y-3">
                                    {selectedUser.email && (
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                                </svg>
                                            </span>
                                            <div>
                                                <p className="text-xs text-gray-400 font-medium">Email</p>
                                                <p className="text-sm font-semibold text-gray-800">{selectedUser.email}</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedUser.phone && (
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.61 5a2 2 0 0 1 1.98-2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.33v-.41z"/>
                                                </svg>
                                            </span>
                                            <div>
                                                <p className="text-xs text-gray-400 font-medium">Phone</p>
                                                <p className="text-sm font-semibold text-gray-800">{selectedUser.phone}</p>
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
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">Connect on Social</p>
                                            <div className="flex justify-center gap-3">
                                                {socials.map(social => (
                                                    <a
                                                        key={social.key}
                                                        href={social.url!}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title={social.label}
                                                        className={`w-11 h-11 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center transition-all duration-200 hover:text-white hover:scale-110 hover:shadow-lg ${social.color}`}
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
        </div>
    );
}
