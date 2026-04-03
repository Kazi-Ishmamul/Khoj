// Items.tsx
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
}

const ITEMS_PER_PAGE = 15;

export default function Items() {
    const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showReportModal, setShowReportModal] = useState(false);
    const [fetchedItems, setFetchedItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    // Fetch items from API on component mount
    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);
                // Get current user ID from localStorage
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        setCurrentUserId(user.id);
                    } catch (e) {
                        console.error('Failed to parse user from localStorage');
                    }
                }

                const response = await axios.get('http://localhost:8000/api/items');
                setFetchedItems(response.data.items);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                setFetchedItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    // Report form state
    const [formData, setFormData] = useState({
        itemName: '',
        category: '',
        description: '',
        dateTime: new Date().toISOString().slice(0, 16),
        location: '',
        status: 'lost' as 'lost' | 'found',
        contact: '',
    });

    const [itemImage, setItemImage] = useState<File | null>(null);
    const [itemImagePreview, setItemImagePreview] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showUserModal, setShowUserModal] = useState(false);

    // Toggleable actions per item (local state only — use backend in production)
    const [itemActions, setItemActions] = useState<Record<number, { claimed?: boolean; reported?: boolean }>>({});

    const toggleClaim = (id: number) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to claim items');
            return;
        }

        // Update local state immediately for UI feedback
        setItemActions(prev => {
            const current = prev[id] || {};
            const willBeClaimed = !current.claimed;
            return {
                ...prev,
                [id]: {
                    claimed: willBeClaimed,
                    reported: false,
                },
            };
        });

        // Send to backend
        axios.put(`http://localhost:8000/api/items/${id}/claim`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            console.log('Claim response:', response.data);
            alert(response.data.message || 'Claim updated successfully');
        }).catch(err => {
            console.error('Error toggling claim:', err);
            const errorMsg = err.response?.data?.message || 'Failed to update claim status';
            alert(errorMsg);
            // Revert UI change on error
            setItemActions(prev => {
                const current = prev[id] || {};
                return {
                    ...prev,
                    [id]: {
                        ...current,
                        claimed: !current.claimed
                    }
                };
            });
        });
    };

    const toggleReport = (id: number) => {
        setItemActions(prev => {
            const current = prev[id] || {};
            const willBeReported = !current.reported;
            return {
                ...prev,
                [id]: {
                    reported: willBeReported,
                    claimed: false, // mutually exclusive
                },
            };
        });
    };


    // Filter + search logic
    const filteredReports = fetchedItems.filter((report) => {
        // Exclude user's own items
        if (currentUserId && report.user_id === currentUserId) {
            return false;
        }
        const matchesFilter = filter === 'all' || report.status === filter;
        const matchesSearch =
            searchTerm === '' ||
            report.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.location.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
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
            alert('Please login to report items');
            return;
        }

        try {
            let imageUrl = 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400';

            // Upload image to Cloudinary if provided
            if (itemImage) {
                const uploadData = new FormData();
                uploadData.append('file', itemImage);
                uploadData.append('upload_preset', 'khoj-profile');

                try {
                    const cloudinaryRes = await axios.post('https://api.cloudinary.com/v1_1/dait0sacc/image/upload', uploadData);
                    imageUrl = cloudinaryRes.data.secure_url;
                } catch (err) {
                    alert('Failed to upload image to Cloudinary.');
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

            alert('Report submitted successfully!');
            setFormData({
                itemName: '',
                category: '',
                description: '',
                dateTime: new Date().toISOString().slice(0, 16),
                location: '',
                status: 'lost',
                contact: '',
            });
            setItemImage(null);
            setItemImagePreview(null);
            setShowReportModal(false);

            // Refresh items list
            const itemsResponse = await axios.get('http://localhost:8000/api/items');
            setFetchedItems(itemsResponse.data.items);
        } catch (err) {
            console.error('Error submitting report:', err);
            alert(err instanceof Error ? err.message : 'Failed to submit report');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 relative">
            <div className="container mx-auto px-4 max-w-7xl">

                {/* Header + Report Button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Lost & Found Items</h1>
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all"
                    >
                        + Report Lost / Found Item
                    </button>
                </div>

                {/* Filters + Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex gap-3">
                        <button
                            onClick={() => { setFilter('all'); setCurrentPage(1); }}
                            className={`px-5 py-2 rounded-full font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => { setFilter('lost'); setCurrentPage(1); }}
                            className={`px-5 py-2 rounded-full font-medium transition-colors ${filter === 'lost' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Lost
                        </button>
                        <button
                            onClick={() => { setFilter('found'); setCurrentPage(1); }}
                            className={`px-5 py-2 rounded-full font-medium transition-colors ${filter === 'found' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Found
                        </button>
                    </div>

                    <input
                        type="text"
                        placeholder="Search items, locations..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Items Grid */}
                {loading ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                        <p className="text-xl text-gray-500">Loading items...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                        <p className="text-xl text-red-500">Error: {error}</p>
                    </div>
                ) : paginatedReports.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                        <p className="text-xl text-gray-500">No items found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedReports.map(report => {
                            const action = itemActions[report.id] || {};
                            return (
                                <div
                                    key={report.id}
                                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col group"
                                >
                                    {/* Image Container with Status Badge */}
                                    <div className="relative overflow-hidden h-56 bg-gradient-to-br from-gray-100 to-gray-200">
                                        {report.item_image_url && (
                                            <img
                                                src={report.item_image_url}
                                                alt={report.item_name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        )}
                                        {/* Status Badge - Floating */}
                                        <span
                                            className={`absolute top-3 right-3 px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md ${
                                                report.status === 'lost'
                                                    ? 'bg-red-500/90 text-white shadow-lg'
                                                    : 'bg-green-500/90 text-white shadow-lg'
                                            }`}
                                        >
                                            {report.status === 'lost' ? '🔴 LOST' : '🟢 FOUND'}
                                        </span>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        {/* Item Title */}
                                        <h3 className="text-2xl font-bold text-gray-900 mb-1 line-clamp-2">
                                            {report.item_name}
                                        </h3>
                                        <p className="text-sm font-semibold text-blue-600 mb-4 capitalize">
                                            {report.category || 'Uncategorized'}
                                        </p>

                                        {/* Description */}
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                                            {report.description}
                                        </p>

                                        {/* User Info Card */}
                                        {report.user && (
                                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-4 border border-blue-100">
                                                <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
                                                    setSelectedUser(report.user!);
                                                    setShowUserModal(true);
                                                }}>
                                                    <img
                                                        src={report.user.pic_url || 'https://ui-avatars.com/api/?name=User&background=random'}
                                                        alt={report.user.name}
                                                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md hover:ring-2 hover:ring-blue-500 transition-all"
                                                    />
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Posted by</p>
                                                        <p className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">{report.user.name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Info Grid */}
                                        <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
                                            <div className="bg-gray-50 rounded-lg p-2">
                                                <p className="text-gray-500 font-semibold mb-1">📍 Location</p>
                                                <p className="text-gray-800 font-medium line-clamp-1">{report.location}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-2">
                                                <p className="text-gray-500 font-semibold mb-1">📅 Date</p>
                                                <p className="text-gray-800 font-medium">{new Date(report.date_time).toLocaleDateString()}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-2 col-span-2">
                                                <p className="text-gray-500 font-semibold mb-1">📞 Contact</p>
                                                <p className="text-gray-800 font-medium truncate">{report.contact_info}</p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="mt-auto flex gap-2">
                                            <button
                                                onClick={() => toggleClaim(report.id)}
                                                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 active:scale-100 ${
                                                    action.claimed
                                                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl'
                                                        : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 hover:from-green-200 hover:to-emerald-200 border border-green-300'
                                                }`}
                                            >
                                                {action.claimed ? '✓ Claimed' : '🙋 Claim'}
                                            </button>

                                            <button
                                                onClick={() => toggleReport(report.id)}
                                                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 active:scale-100 ${
                                                    action.reported
                                                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg hover:shadow-xl'
                                                        : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 hover:from-orange-200 hover:to-red-200 border border-orange-300'
                                                }`}
                                            >
                                                {action.reported ? '⚠ Reported' : '🚩 Report'}
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
                            className="px-5 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        <span className="text-gray-700 font-medium">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-5 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
                        onClick={() => setShowReportModal(false)}
                    />

                    <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto pt-20 md:pt-24">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 my-8 max-h-[calc(100vh-10rem)] overflow-y-auto">
                            <div className="p-6 md:p-8">
                                <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-2 border-b">
                                    <h2 className="text-2xl font-bold text-gray-800">Report Lost or Found Item</h2>
                                    <button
                                        onClick={() => setShowReportModal(false)}
                                        className="text-gray-600 hover:text-gray-900 text-3xl font-bold leading-none"
                                    >
                                        ×
                                    </button>
                                </div>

                                <form onSubmit={handleSubmitReport} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                                        <input
                                            type="text"
                                            name="itemName"
                                            value={formData.itemName}
                                            onChange={handleFormChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <input
                                            type="text"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleFormChange}
                                            rows={3}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            name="dateTime"
                                            value={formData.dateTime}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleFormChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="lost">Lost</option>
                                            <option value="found">Found</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info *</label>
                                        <input
                                            type="text"
                                            name="contact"
                                            value={formData.contact}
                                            onChange={handleFormChange}
                                            required
                                            placeholder="Phone or Email"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Item Image (optional)</label>
                                        <div className="flex items-center gap-4">
                                            {itemImagePreview && (
                                                <img
                                                    src={itemImagePreview}
                                                    alt="Preview"
                                                    className="w-20 h-20 rounded-lg object-cover border-2 border-blue-300"
                                                />
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 flex justify-end gap-4 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowReportModal(false)}
                                            className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                        >
                                            Submit Report
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
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
                        onClick={() => setShowUserModal(false)}
                    />
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 my-8 overflow-hidden">

                            {/* Modal Header Banner */}
                            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 h-24">
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

                            <div className="px-8 pb-8">
                                {/* Profile Picture - overlapping banner */}
                                <div className="flex flex-col items-center -mt-12 mb-4 relative z-10">
                                    <img
                                        src={selectedUser.pic_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedUser.name) + '&background=4F46E5&color=fff&size=150'}
                                        alt={selectedUser.name}
                                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl bg-white"
                                    />
                                    <h2 className="text-2xl font-bold text-gray-900 text-center mt-3">{selectedUser.name}</h2>
                                    {selectedUser.info?.bio && (
                                        <div className="mt-3 px-2 text-center">
                                            <p className="text-sm text-gray-600 italic leading-relaxed">"{selectedUser.info.bio}"</p>
                                        </div>
                                    )}
                                </div>

                                {/* Contact Info */}
                                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-5 mb-5 border border-blue-100 space-y-3">
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
                                                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
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
                                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
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
                                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
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
                                    })()
                                )}


                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}