// Items.tsx
import { useState } from 'react';

interface Report {
    id: number;
    itemName: string;
    category: string;
    description: string;
    dateTime: string;
    location: string;
    status: 'lost' | 'found';
    contact: string;
    image?: string;
}

const mockReports: Report[] = [
    {
        id: 1,
        itemName: "Black iPhone 14",
        category: "Electronics",
        description: "Lost in cafeteria, has a blue case with stars",
        dateTime: "2025-03-12 14:30",
        location: "NSU Campus, Dhaka",
        status: "lost",
        contact: "01812-345678",
        image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400",
    },
    {
        id: 2,
        itemName: "Red Wallet",
        category: "Accessories",
        description: "Found near library stairs",
        dateTime: "2025-03-15 09:15",
        location: "BRAC University",
        status: "found",
        contact: "found@bracu.ac.bd",
        image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400",
    },
    // add more as needed
];

const ITEMS_PER_PAGE = 15;

export default function Items() {
    const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showReportModal, setShowReportModal] = useState(false);

    // Report form state
    const [formData, setFormData] = useState({
        itemName: '',
        category: '',
        description: '',
        dateTime: new Date().toISOString().slice(0, 16),
        location: '',
        status: 'lost' as 'lost' | 'found',
        contact: '',
        image: null as File | null,
    });

    // Toggleable actions per item (local state only — use backend in production)
    const [itemActions, setItemActions] = useState<Record<number, { claimed?: boolean; reported?: boolean }>>({});

    const toggleClaim = (id: number) => {
        setItemActions(prev => {
            const current = prev[id] || {};
            const willBeClaimed = !current.claimed;
            return {
                ...prev,
                [id]: {
                    claimed: willBeClaimed,
                    reported: false, // mutually exclusive
                },
            };
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
    const filteredReports = mockReports.filter((report) => {
        const matchesFilter = filter === 'all' || report.status === filter;
        const matchesSearch =
            searchTerm === '' ||
            report.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        if (e.target.files?.[0]) {
            setFormData(prev => ({ ...prev, image: e.target.files![0] }));
        }
    };

    const handleSubmitReport = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("New report submitted:", formData);
        alert("Report submitted! (mock — in real app send to backend)");
        setFormData({
            itemName: '',
            category: '',
            description: '',
            dateTime: new Date().toISOString().slice(0, 16),
            location: '',
            status: 'lost',
            contact: '',
            image: null,
        });
        setShowReportModal(false);
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
                {paginatedReports.length === 0 ? (
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
                                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col"
                                >
                                    {report.image && (
                                        <img
                                            src={report.image}
                                            alt={report.itemName}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-semibold text-gray-800">{report.itemName}</h3>
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${report.status === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                    }`}
                                            >
                                                {report.status.toUpperCase()}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-3">{report.category}</p>
                                        <p className="text-gray-700 mb-4 line-clamp-3">{report.description}</p>

                                        <div className="text-sm text-gray-500 space-y-1 mb-6">
                                            <p><span className="font-medium">Location:</span> {report.location}</p>
                                            <p><span className="font-medium">When:</span> {report.dateTime}</p>
                                            <p><span className="font-medium">Contact:</span> {report.contact}</p>
                                        </div>

                                        <div className="mt-auto flex gap-3">
                                            <button
                                                onClick={() => toggleClaim(report.id)}
                                                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${action.claimed
                                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    }`}
                                            >
                                                {action.claimed ? 'Claimed ✓' : 'Claim'}
                                            </button>

                                            <button
                                                onClick={() => toggleReport(report.id)}
                                                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${action.reported
                                                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                                                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                                    }`}
                                            >
                                                {action.reported ? 'Reported ⚠' : 'Report'}
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Image (optional)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
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
        </div>
    );
}