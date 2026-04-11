import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaMapMarkerAlt, FaSyncAlt } from 'react-icons/fa';

// Fix for default marker icons
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

interface Item {
    id: number;
    item_name: string;
    category: string;
    description: string;
    status: 'lost' | 'found';
    lat: number | null;
    lng: number | null;
    item_image_url?: string;
    location: string;
}

// Custom Icons for Red (Lost) and Blue (Found)
const lostIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const foundIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function MapView() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMapItems = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/api/items');
            // Filter only for items that have valid coordinates
            const itemsWithCoords = (response.data.data || []).filter(
                (item: Item) => item.lat !== null && item.lng !== null
            );
            setItems(itemsWithCoords);
        } catch (err) {
            console.error('Error fetching map items:', err);
            toast.error('Failed to load map data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMapItems();
    }, []);

    return (
        <div className="h-[calc(100vh-120px)] w-full rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl relative bg-slate-900">
            {/* Overlay Controls */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                <button 
                    onClick={fetchMapItems}
                    disabled={loading}
                    className="p-3 bg-slate-900/90 backdrop-blur text-white rounded-2xl border border-slate-700 hover:bg-slate-800 transition-all shadow-xl"
                    title="Refresh Map"
                >
                    <FaSyncAlt className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-6 left-6 z-[1000] bg-slate-950/90 backdrop-blur p-4 rounded-2xl border border-slate-700/60 shadow-2xl text-xs flex flex-col gap-3">
                <p className="font-bold text-slate-100 uppercase tracking-widest mb-1 opacity-70">Legend</p>
                <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
                    <span className="text-slate-300 font-medium">Lost Items</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                    <span className="text-slate-300 font-medium">Found Items</span>
                </div>
                <div className="mt-1 pt-2 border-t border-slate-800 text-slate-500 italic">
                    {items.length} items pinned globally
                </div>
            </div>

            <MapContainer 
                center={[23.7639, 90.4066]} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {items.map(item => (
                    <Marker 
                        key={item.id} 
                        position={[Number(item.lat), Number(item.lng)]}
                        icon={item.status === 'lost' ? lostIcon : foundIcon}
                    >
                        <Popup className="custom-popup">
                            <div className="p-1 min-w-[200px]">
                                {item.item_image_url && (
                                    <img 
                                        src={item.item_image_url} 
                                        alt={item.item_name} 
                                        className="w-full h-32 object-cover rounded-lg mb-2 border border-slate-200" 
                                    />
                                )}
                                <h3 className="font-bold text-slate-900 text-base mb-1">{item.item_name}</h3>
                                <p className="text-xs text-slate-500 mb-2 italic">{item.category}</p>
                                <p className="text-sm text-slate-700 line-clamp-2 mb-3 leading-snug">
                                    {item.description}
                                </p>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-3 bg-slate-50 p-1.5 rounded-md">
                                    <FaMapMarkerAlt className="text-slate-400" />
                                    <span className="truncate">{item.location}</span>
                                </div>
                                <button
                                    className="w-full bg-slate-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-slate-800 transition-colors uppercase tracking-wider"
                                    onClick={() => window.location.href = `/user-dashboard/items`}
                                >
                                    View in Dashboard
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <style>{`
                .leaflet-popup-content-wrapper {
                    border-radius: 1.5rem;
                    padding: 0;
                    overflow: hidden;
                    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
                }
                .leaflet-popup-content {
                    margin: 0;
                    width: 200px !important;
                }
                .leaflet-container {
                    background-color: #0f172a;
                }
            `}</style>
        </div>
    );
}
