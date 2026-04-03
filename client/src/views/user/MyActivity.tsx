import { useState, useEffect } from 'react';
import axios from 'axios';

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
    claims?: Claim[];
}

interface Claim {
    claim_id: number;
    item_id: number;
    claimed_by_id: number;
    validity: number;
    created_at?: string;
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
                                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col"
                            >
                                {item.item_image_url && (
                                    <img
                                        src={item.item_image_url}
                                        alt={item.item_name}
                                        className="w-full h-48 object-cover"
                                    />
                                )}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-semibold text-gray-800">{item.item_name}</h3>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBg(item.status)}`}
                                        >
                                            {item.status.toUpperCase()}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-3">{item.category}</p>
                                    <p className="text-gray-700 mb-4 line-clamp-2">{item.description}</p>

                                    <div className="text-sm text-gray-500 space-y-1 mb-4">
                                        <p>
                                            <span className="font-medium">📍 Location:</span> {item.location}
                                        </p>
                                        <p>
                                            <span className="font-medium">📅 When:</span> {new Date(item.date_time).toLocaleDateString()}
                                        </p>
                                        <p>
                                            <span className="font-medium">📞 Contact:</span> {item.contact_info}
                                        </p>
                                    </div>

                                    <div className="mt-auto">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                                item.resolution_status === 'resolved'
                                                    ? 'bg-green-100 text-green-700'
                                                    : item.resolution_status === 'claimed'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-gray-100 text-gray-700'
                                            }`}
                                        >
                                            {item.resolution_status === 'resolved'
                                                ? '✅ Resolved'
                                                : item.resolution_status === 'claimed'
                                                    ? '⏳ Pending'
                                                    : '⭕ Not Claimed'}
                                        </span>

                                        {/* Accept/Decline buttons for Claims Received */}
                                        {activeTab === 'claims_received' && item.claims && item.claims.length > 0 && (
                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => handleAcceptClaim(item.claims![0].claim_id)}
                                                    disabled={actionLoading === item.claims![0].claim_id}
                                                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {actionLoading === item.claims![0].claim_id ? 'Processing...' : 'Accept'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeclineClaim(item.claims![0].claim_id)}
                                                    disabled={actionLoading === item.claims![0].claim_id}
                                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {actionLoading === item.claims![0].claim_id ? 'Processing...' : 'Decline'}
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
