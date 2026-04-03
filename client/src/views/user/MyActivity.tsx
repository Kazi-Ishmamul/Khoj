import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: number;
    name: string;
    pic_url?: string;
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
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={item.user.pic_url || 'https://ui-avatars.com/api/?name=User&background=random'}
                                                    alt={item.user.name}
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                                                />
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Posted by</p>
                                                    <p className="text-sm font-bold text-gray-900">{item.user.name}</p>
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
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={item.claimedByUser.pic_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(item.claimedByUser.name) + '&background=random'}
                                                    alt={item.claimedByUser.name}
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                                                />
                                                <div>
                                                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">
                                                        {activeTab === 'claim_requests' ? '🙋 Your Claim' : activeTab === 'claims_received' ? '👤 Claimed by' : '✓ Resolved with'}
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-900">{item.claimedByUser.name}</p>
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
        </div>
    );
}
