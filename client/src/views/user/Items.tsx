import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaGlobeAmericas } from 'react-icons/fa';
import MapPicker from '../../components/MapPicker';

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
}

const ITEMS_PER_PAGE = 15;

export default function Items() {
    const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
    const [activeView, setActiveView] = useState<'database' | 'search' | 'suggestions'>('database');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showReportModal, setShowReportModal] = useState(false);

    // Separated State Models
    const [dbItems, setDbItems] = useState<Item[]>([]);
    const [searchItems, setSearchItems] = useState<Item[]>([]);
    const [suggestionItems, setSuggestionItems] = useState<Item[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [claimedItemIds, setClaimedItemIds] = useState<number[]>([]);
    const [claimLoadingId, setClaimLoadingId] = useState<number | null>(null);
    const [reportedItemIds, setReportedItemIds] = useState<number[]>([]);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await axios.get('http://localhost:8000/api/items', config);
            setDbItems(response.data.items);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setDbItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewSuggestions = () => {
        setActiveView('suggestions');

        // If we already have items in state, no need to fetch
        if (suggestionItems.length > 0) return;

        // Try to load from localStorage cache
        const cached = localStorage.getItem('khoj_suggestions_cache');
        if (cached) {
            try {
                setSuggestionItems(JSON.parse(cached));
                return;
            } catch (e) {
                console.error("Failed to parse cached suggestions", e);
            }
        }

        // Only explicitly hit Gemini if we have nothing at all
        fetchSuggestions(false);
    };

    const fetchSuggestions = async (forceRefresh = false) => {
        try {
            setLoading(true);
            setActiveView('suggestions');
            setCurrentPage(1);
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to get suggestions');
                setSuggestionItems([]);
                return;
            }
            const response = await axios.get('http://localhost:8000/api/items/suggestions/match', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const items = response.data.items || [];
            setSuggestionItems(items);
            localStorage.setItem('khoj_suggestions_cache', JSON.stringify(items));
            setError(null);

            if (forceRefresh) {
                toast.success('Suggestions refreshed successfully!');
            }
        } catch (err) {
            console.error('Suggestions error:', err);
            setError(err instanceof Error ? err.message : 'Suggestions failed to load');
            setSuggestionItems([]);
        } finally {
            setLoading(false);
        }
    };

    const performGeminiSearch = async (query: string) => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return;

        // Try to load exact query match from localStorage cache
        const cacheKey = `khoj_search_cache_${normalizedQuery}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                setSearchItems(JSON.parse(cached));
                setActiveView('search');
                setCurrentPage(1);
                return;
            } catch (e) {
                console.error("Failed to parse cached search logic", e);
            }
        }

        try {
            setLoading(true);
            setActiveView('search');
            setCurrentPage(1);
            const params = { q: query, filter: 'all' }; // Search across all initially
            const response = await axios.get('http://localhost:8000/api/items/search', { params });
            const items = response.data.items || [];

            setSearchItems(items);
            localStorage.setItem(cacheKey, JSON.stringify(items));
            setError(null);
        } catch (err) {
            console.error('Search error:', err);
            setError(err instanceof Error ? err.message : 'Search failed');
            setSearchItems([]);
        } finally {
            setLoading(false);
        }
    };

    const triggerSearch = () => {
        if (!searchTerm.trim()) {
            setActiveView('database');
            setCurrentPage(1);
        } else {
            performGeminiSearch(searchTerm);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            triggerSearch();
        }
    };

    const fetchClaimedItemIds = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setClaimedItemIds([]);
            return;
        }

        try {
            const response = await axios.get('http://localhost:8000/api/my-activity', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            const claimedIds = (response.data?.data?.claim_requests?.items || [])
                .map((item: Item) => item.id);

            setClaimedItemIds(Array.from(new Set(claimedIds)));
        } catch {
            setClaimedItemIds([]);
        }
    };

    const fetchReportedItemIds = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setReportedItemIds([]);
            return;
        }
        try {
            const response = await axios.get('http://localhost:8000/api/my-reports', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (response.data?.success) {
                setReportedItemIds(response.data.data.reported_item_ids || []);
            }
        } catch {
            setReportedItemIds([]);
        }
    };

    // Fetch items from API on component mount
    useEffect(() => {
        // Get current user ID from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setCurrentUserId(user.id);
            } catch {
                console.error('Failed to parse user from localStorage');
            }
        }

        fetchItems();
        fetchClaimedItemIds();
        fetchReportedItemIds();

        // Cleanup timeout on component unmount
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // Report item form state (for submitting lost/found)
    const [formData, setFormData] = useState({
        itemName: '',
        category: '',
        description: '',
        dateTime: new Date().toISOString().slice(0, 16),
        location: '',
        status: 'lost' as 'lost' | 'found',
        contact: '',
        lat: null as number | null,
        lng: null as number | null,
    });

    const [itemImage, setItemImage] = useState<File | null>(null);
    const [itemImagePreview, setItemImagePreview] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showUserModal, setShowUserModal] = useState(false);

    // Report violation form state (for reporting items as fake/suspicious)
    const [showViolationModal, setShowViolationModal] = useState(false);
    const [selectedItemForReport, setSelectedItemForReport] = useState<Item | null>(null);
    const [violationReason, setViolationReason] = useState('');
    const [reportingId, setReportingId] = useState<number | null>(null);

    const toggleClaim = async (id: number) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to claim items');
            return;
        }

        try {
            setClaimLoadingId(id);
            const response = await axios.put(`http://localhost:8000/api/items/${id}/claim`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            console.log('Claim response:', response.data);
            toast.success(response.data.message || 'Claim updated successfully');
            await fetchItems();
            await fetchClaimedItemIds();
        } catch (err: any) {
            console.error('Error toggling claim:', err);
            const errorMsg = err.response?.data?.message || 'Failed to update claim status';
            toast.error(errorMsg);
        } finally {
            setClaimLoadingId(null);
        }
    };

    const toggleReport = (item: Item) => {
        setSelectedItemForReport(item);
        setViolationReason('');
        setShowViolationModal(true);
    };

    const submitViolationReport = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (!token) {
            toast.error('Please login to report items');
            return;
        }

        if (!selectedItemForReport || !violationReason.trim()) {
            toast.error('Please provide a reason for the report');
            return;
        }

        try {
            setReportingId(selectedItemForReport.id);
            await axios.post(
                'http://localhost:8000/api/reports',
                {
                    item_id: selectedItemForReport.id,
                    reason: violationReason
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            toast.success('Report submitted successfully. Admins will review it.');
            setShowViolationModal(false);
            setSelectedItemForReport(null);
            setViolationReason('');
            setReportedItemIds(prev => [...prev, selectedItemForReport.id]);
            // Refresh from server to keep state in sync
            fetchReportedItemIds();
        } catch (err: any) {
            console.error('Error submitting report:', err);
            const errorMsg = err.response?.data?.message || 'Failed to submit report';
            toast.error(errorMsg);
        } finally {
            setReportingId(null);
        }
    };


    // Select correct array based on activeView
    let sourceItems: Item[] = [];
    if (activeView === 'database') {
        sourceItems = dbItems.filter(item => filter === 'all' || item.status === filter);
    } else if (activeView === 'search') {
        sourceItems = searchItems;
    } else if (activeView === 'suggestions') {
        sourceItems = suggestionItems;
    }

    const filteredReports = sourceItems.filter((report) => {
        if (report.valid !== 1 || report.resolution_status === 'resolved') {
            return false;
        }

        // Exclude user's own items
        if (currentUserId && report.user_id === currentUserId) {
            return false;
        }

        return true;
    });

    const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedReports = filteredReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setItemImage(file);
        setItemImagePreview(URL.createObjectURL(file));
    };

    const handleSubmitReport = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (!token) {
            toast.error('Please login to report items');
            return;
        }

        try {
            let imageUrl = 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400';

            // Upload image to Cloudinary if provided
            if (itemImage) {
                const uploadData = new FormData();
                uploadData.append('file', itemImage);
                uploadData.append('upload_preset', 'khoj-items');

                try {
                    const cloudinaryRes = await axios.post('https://api.cloudinary.com/v1_1/dait0sacc/image/upload', uploadData);
                    imageUrl = cloudinaryRes.data.secure_url;
                } catch (err) {
                    toast.error('Failed to upload image to Cloudinary.');
                    return;
                }
            }

            // Submit report to backend
            const reportData = {
                item_name: formData.itemName,
                category: formData.category,
                description: formData.description,
                date_time: formData.dateTime,
                location: formData.location,
                status: formData.status,
                contact_info: formData.contact,
                item_image_url: imageUrl
            };

            await axios.post('http://localhost:8000/api/items', reportData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            toast.success('Report submitted successfully!');
            setFormData({
                itemName: '',
                category: '',
                description: '',
                dateTime: new Date().toISOString().slice(0, 16),
                location: '',
                status: 'lost',
                contact: '',
                lat: null,
                lng: null,
            });
            setItemImage(null);
            setItemImagePreview(null);
            setShowReportModal(false);

            // Refresh items list
            await fetchItems();
            await fetchClaimedItemIds();
        } catch (err) {
            console.error('Error submitting report:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to submit report');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 py-10 relative text-slate-100">
            <div className="container mx-auto px-4 max-w-7xl">

                {/* Header + Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 mb-3 tracking-tight">
                            Lost & Found
                        </h1>
                        <p className="text-gray-500 text-lg max-w-xl">
                            {activeView === 'database' && "Browse reported physical items across the ecosystem."}
                            {activeView === 'search' && `AI Search Results for "${searchTerm}"`}
                            {activeView === 'suggestions' && "AI-powered proactive matching for your registered items."}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => activeView === 'suggestions' ? fetchSuggestions(true) : handleViewSuggestions()}
                            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-sm border ${activeView === 'suggestions'
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/30 border-transparent'
                                : 'bg-slate-900/80 text-slate-100 border-slate-700 hover:bg-slate-800 hover:shadow-md'
                                }`}
                        >
                            <span className="text-xl">✨</span>
                            {activeView === 'suggestions' ? 'Refresh Suggestions' : 'Smart Suggestions'}
                        </button>

                        <button
                            onClick={() => setShowReportModal(true)}
                            className="flex-1 md:flex-none justify-center bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-6 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-sky-900/30 border border-sky-300/30"
                        >
                            + Post Item
                        </button>
                    </div>
                </div>

                {/* Main Filter & Search Control Panel */}
                <div className="bg-slate-900/80 p-2 rounded-3xl shadow-sm border border-slate-700/70 flex flex-col lg:flex-row gap-4 mb-10 sticky top-4 z-40 backdrop-blur-xl">
                    {/* Segmented Control Tabs */}
                    <div className="flex p-1 bg-slate-800/70 backdrop-blur-md rounded-2xl w-full lg:w-auto flex-1 lg:flex-none relative h-14 min-h-14 border border-slate-700/60">
                        <button
                            onClick={() => {
                                setActiveView('database');
                                setFilter('all');
                                setCurrentPage(1);
                                setSearchTerm('');
                            }}
                            className={`flex-1 px-8 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 z-10 ${activeView === 'database' && filter === 'all' ? 'bg-slate-100 text-slate-950 shadow border border-slate-200' : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => {
                                setActiveView('database');
                                setFilter('lost');
                                setCurrentPage(1);
                                setSearchTerm('');
                            }}
                            className={`flex-1 px-8 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 z-10 ${activeView === 'database' && filter === 'lost' ? 'bg-rose-500/15 text-rose-300 shadow border border-rose-500/30' : 'text-slate-400 hover:text-rose-300'
                                }`}
                        >
                            Lost
                        </button>
                        <button
                            onClick={() => {
                                setActiveView('database');
                                setFilter('found');
                                setCurrentPage(1);
                                setSearchTerm('');
                            }}
                            className={`flex-1 px-8 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 z-10 ${activeView === 'database' && filter === 'found' ? 'bg-emerald-500/15 text-emerald-300 shadow border border-emerald-500/30' : 'text-slate-400 hover:text-emerald-300'
                                }`}
                        >
                            Found
                        </button>
                    </div>

                    {/* Search Field */}
                    <div className="relative flex-1 lg:max-w-md h-14 min-h-14 shrink-0">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            {activeView === 'search' ? (
                                <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                </span>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            )}
                        </div>
                        <input
                            type="text"
                            placeholder="Ask Gemini to find something..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className={`w-full h-full min-h-14 pl-12 pr-14 outline-none border transition-all duration-300 rounded-xl text-slate-100 placeholder-slate-400 bg-slate-950/60 ${activeView === 'search' ? 'border-sky-400 ring-4 ring-sky-500/15' : 'border-slate-700 focus:border-slate-500 focus:ring-4 focus:ring-slate-500/10'
                                }`}
                        />
                        <button
                            onClick={triggerSearch}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                            title="Semantic Search"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Items Grid */}
                {loading ? (
                    <div className="text-center py-16 bg-slate-900/80 rounded-3xl shadow-sm border border-slate-700/60">
                        <p className="text-xl text-slate-300">Loading items...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-16 bg-slate-900/80 rounded-3xl shadow-sm border border-slate-700/60">
                        <p className="text-xl text-rose-300">Error: {error}</p>
                    </div>
                ) : paginatedReports.length === 0 ? (
                    <div className="text-center py-16 bg-slate-900/80 rounded-3xl shadow-sm border border-slate-700/60">
                        <p className="text-xl text-slate-300">No items found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedReports.map(report => {
                            const isClaimed = claimedItemIds.includes(report.id);
                            const isReported = reportedItemIds.includes(report.id);
                            return (
                                <div
                                    key={report.id}
                                    className="bg-slate-900/90 rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-slate-700/70 flex flex-col group backdrop-blur-sm"
                                >
                                    {/* Image Container with Status Badge */}
                                    <div className="relative overflow-hidden h-56 bg-gradient-to-br from-slate-800 to-slate-900">
                                        {report.item_image_url && (
                                            <img
                                                src={report.item_image_url}
                                                alt={report.item_name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        )}
                                        {/* Status Badge - Floating */}
                                        <span
                                            className={`absolute top-3 right-3 px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md ${report.status === 'lost'
                                                ? 'bg-red-500/90 text-white shadow-lg'
                                                : 'bg-green-500/90 text-white shadow-lg'
                                                }`}
                                        >
                                            {report.status === 'lost' ? '🔴 LOST' : '🟢 FOUND'}
                                        </span>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        {/* Item Title */}
                                        <h3 className="text-2xl font-bold text-slate-100 mb-1 line-clamp-2">
                                            {report.item_name}
                                        </h3>
                                        <p className="text-sm font-semibold text-sky-300 mb-4 capitalize">
                                            {report.category || 'Uncategorized'}
                                        </p>

                                        {/* Description */}
                                        <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                                            {report.description}
                                        </p>

                                        {/* User Info Card */}
                                        {report.user && (
                                            <div className="bg-slate-800/70 rounded-2xl p-3 mb-4 border border-slate-700/60">
                                                <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
                                                    setSelectedUser(report.user!);
                                                    setShowUserModal(true);
                                                }}>
                                                    <img
                                                        src={report.user.pic_url || 'https://ui-avatars.com/api/?name=User&background=random'}
                                                        alt={report.user.name}
                                                        className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 shadow-md hover:ring-2 hover:ring-sky-500 transition-all"
                                                    />
                                                    <div>
                                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Posted by</p>
                                                        <p className="text-sm font-bold text-slate-100 hover:text-sky-300 transition-colors">{report.user.name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Info Grid */}
                                        <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
                                            <div className="bg-slate-800/60 rounded-xl p-2 border border-slate-700/60">
                                                <p className="text-slate-400 font-semibold mb-1">📍 Location</p>
                                                <p className="text-slate-100 font-medium line-clamp-1">{report.location}</p>
                                            </div>
                                            <div className="bg-slate-800/60 rounded-xl p-2 border border-slate-700/60">
                                                <p className="text-slate-400 font-semibold mb-1">📅 Date</p>
                                                <p className="text-slate-100 font-medium">{new Date(report.date_time).toLocaleDateString()}</p>
                                            </div>
                                            <div className="bg-slate-800/60 rounded-xl p-2 col-span-2 border border-slate-700/60">
                                                <p className="text-slate-400 font-semibold mb-1">📞 Contact</p>
                                                <p className="text-slate-100 font-medium truncate">{report.contact_info}</p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="mt-auto flex gap-2">
                                            <button
                                                onClick={() => toggleClaim(report.id)}
                                                disabled={claimLoadingId === report.id}
                                                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 active:scale-100 ${isClaimed
                                                    ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg hover:shadow-xl'
                                                    : 'bg-gradient-to-r from-emerald-500/15 to-sky-500/15 text-emerald-200 hover:from-emerald-500/25 hover:to-sky-500/25 border border-emerald-500/30'
                                                    }`}
                                            >
                                                {claimLoadingId === report.id ? '⏳ Processing...' : isClaimed ? 'Release' : '🙋 Claim'}
                                            </button>

                                            <button
                                                onClick={() => !isReported && toggleReport(report)}
                                                disabled={isReported || reportingId === report.id}
                                                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${isReported
                                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                                    : 'bg-gradient-to-r from-amber-500/15 to-rose-500/15 text-amber-200 hover:from-amber-500/25 hover:to-rose-500/25 border border-amber-500/30 transform hover:scale-105 active:scale-100'
                                                    }`}
                                            >
                                                {reportingId === report.id ? '⏳ Reporting...' : isReported ? '⚠ Reported' : '🚩 Report'}
                                            </button>
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
                            className="px-5 py-2 bg-slate-900/80 text-slate-100 border border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800"
                        >
                            Previous
                        </button>
                        <span className="text-slate-300 font-medium">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-5 py-2 bg-slate-900/80 text-slate-100 border border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Report Modal – starts below navbar */}
            {showReportModal && (
                <>
                    <div
                        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-[9998]"
                        onClick={() => setShowReportModal(false)}
                    />

                    <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto pt-20 md:pt-24">
                        <div className="bg-slate-900 rounded-3xl shadow-2xl ring-1 ring-slate-700/70 w-full max-w-2xl mx-4 my-8 max-h-[calc(100vh-10rem)] overflow-y-auto">
                            <div className="p-6 md:p-8 text-slate-100">
                                <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900 z-10 pb-2 border-b border-slate-700">
                                    <h2 className="text-2xl font-bold text-white">Post Lost or Found Item</h2>
                                    <button
                                        onClick={() => setShowReportModal(false)}
                                        className="text-slate-300 hover:text-white text-3xl font-bold leading-none"
                                    >
                                        ×
                                    </button>
                                </div>

                                <form onSubmit={handleSubmitReport} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Item Name *</label>
                                        <input
                                            type="text"
                                            name="itemName"
                                            value={formData.itemName}
                                            onChange={handleFormChange}
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                                        <input
                                            type="text"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleFormChange}
                                            rows={3}
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            name="dateTime"
                                            value={formData.dateTime}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                            <FaGlobeAmericas className="text-sky-400" />
                                            Pin Point Location (Optional)
                                        </label>
                                        <MapPicker 
                                            lat={formData.lat} 
                                            lng={formData.lng} 
                                            onChange={(lat: number, lng: number) => setFormData(prev => ({ ...prev, lat, lng }))} 
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Text Location *</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleFormChange}
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Status *</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                        >
                                            <option value="lost">Lost</option>
                                            <option value="found">Found</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Contact Info *</label>
                                        <input
                                            type="text"
                                            name="contact"
                                            value={formData.contact}
                                            onChange={handleFormChange}
                                            required
                                            placeholder="Phone or Email"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-300 mb-3">Item Image (optional)</label>
                                        <div className="flex items-center gap-4">
                                            {itemImagePreview && (
                                                <img
                                                    src={itemImagePreview}
                                                    alt="Preview"
                                                    className="w-20 h-20 rounded-lg object-cover border-2 border-slate-600"
                                                />
                                            )}
                                            <input
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
                                            onClick={() => setShowReportModal(false)}
                                            className="px-6 py-2.5 bg-slate-800 text-slate-200 rounded-xl hover:bg-slate-700 transition-colors border border-slate-700"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-8 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 font-medium transition-colors"
                                        >
                                            Submit Post
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* User Profile Modal */}
            {showUserModal && selectedUser && (
                <>
                    <div
                        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-[9998]"
                        onClick={() => setShowUserModal(false)}
                    />
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <div className="bg-slate-900 rounded-3xl shadow-2xl ring-1 ring-slate-700/70 w-full max-w-md mx-4 my-8 overflow-hidden text-slate-100">

                            {/* Modal Header Banner */}
                            <div className="relative bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 h-24">
                                <button
                                    onClick={() => setShowUserModal(false)}
                                    aria-label="Close"
                                    className="absolute top-3 right-3 w-9 h-9 bg-slate-100 rounded-full shadow-lg flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-150"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            <div className="px-8 pb-8">
                                {/* Profile Picture - overlapping banner */}
                                <div className="flex flex-col items-center -mt-12 mb-4 relative z-10">
                                    <img
                                        src={selectedUser.pic_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedUser.name) + '&background=0f172a&color=fff&size=150'}
                                        alt={selectedUser.name}
                                        className="w-24 h-24 rounded-full object-cover border-4 border-slate-800 shadow-xl bg-slate-800"
                                    />
                                    <h2 className="text-2xl font-bold text-white text-center mt-3">{selectedUser.name}</h2>
                                    {selectedUser.info?.bio && (
                                        <div className="mt-3 px-2 text-center">
                                            <p className="text-sm text-slate-400 italic leading-relaxed">"{selectedUser.info.bio}"</p>
                                        </div>
                                    )}
                                </div>

                                {/* Contact Info */}
                                <div className="bg-slate-800/70 rounded-2xl p-5 mb-5 border border-slate-700/60 space-y-3">
                                    {selectedUser.email && (
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-sky-500/15 flex items-center justify-center text-sky-300 flex-shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
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
                                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.61 5a2 2 0 0 1 1.98-2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.33v-.41z" />
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
                                {selectedUser.info && (
                                    (() => {
                                        const socials = [
                                            {
                                                key: 'fb',
                                                url: selectedUser.info.fb_url,
                                                label: 'Facebook',
                                                color: 'hover:bg-blue-600',
                                                icon: (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                                    </svg>
                                                ),
                                            },
                                            {
                                                key: 'x',
                                                url: selectedUser.info.x_url,
                                                label: 'X (Twitter)',
                                                color: 'hover:bg-black',
                                                icon: (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                    </svg>
                                                ),
                                            },
                                            {
                                                key: 'insta',
                                                url: selectedUser.info.insta_url,
                                                label: 'Instagram',
                                                color: 'hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-500 hover:to-orange-400',
                                                icon: (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                                    </svg>
                                                ),
                                            },
                                            {
                                                key: 'linkedin',
                                                url: selectedUser.info.linkedin_url,
                                                label: 'LinkedIn',
                                                color: 'hover:bg-blue-700',
                                                icon: (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                                        <rect x="2" y="9" width="4" height="12" />
                                                        <circle cx="4" cy="4" r="2" />
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
                                                            className={`w-11 h-11 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center transition-all duration-200 hover:text-white hover:scale-110 hover:shadow-lg border border-slate-700 ${social.color}`}
                                                        >
                                                            {social.icon}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null;
                                    })()
                                )}


                            </div>
                        </div>
                    </div>
                </>
            )}
            {/* Violation Report Modal */}
            {showViolationModal && selectedItemForReport && (
                <>
                    <div
                        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-[9998]"
                        onClick={() => !reportingId && setShowViolationModal(false)}
                    />
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <div className="bg-slate-900 rounded-3xl shadow-2xl ring-1 ring-slate-700/70 w-full max-w-md overflow-hidden transform transition-all relative text-slate-100">
                            {/* Accent line */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-rose-500" />

                            <button
                                onClick={() => setShowViolationModal(false)}
                                disabled={reportingId !== null}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 font-bold text-xl disabled:opacity-50"
                            >
                                ✕
                            </button>

                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-300 text-2xl">
                                        🚨
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Report Item</h3>
                                        <p className="text-sm text-slate-400">Flag this item for admin review</p>
                                    </div>
                                </div>

                                <div className="bg-slate-800/70 rounded-xl p-3 mb-5 border border-slate-700/60">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Reporting:</p>
                                    <p className="font-bold text-slate-100 line-clamp-1">{selectedItemForReport.item_name}</p>
                                </div>

                                <form onSubmit={submitViolationReport}>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                        Reason for reporting <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={violationReason}
                                        onChange={(e) => setViolationReason(e.target.value)}
                                        placeholder="e.g., Fake item, inappropriate content, spam..."
                                        rows={4}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/60 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none text-sm text-slate-100 placeholder-slate-500"
                                        disabled={reportingId !== null}
                                    />
                                    <p className="text-xs text-slate-400 mt-2 mb-6">
                                        False reports may result in account suspension.
                                    </p>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowViolationModal(false)}
                                            disabled={reportingId !== null}
                                            className="flex-1 px-4 py-3 rounded-xl border border-slate-700 text-slate-200 font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={reportingId !== null || !violationReason.trim()}
                                            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
                                        >
                                            {reportingId !== null ? 'Submitting...' : 'Submit Report'}
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