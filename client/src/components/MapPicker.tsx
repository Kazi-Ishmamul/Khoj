import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
    lat: number | null;
    lng: number | null;
    onChange: (lat: number, lng: number) => void;
    defaultLat?: number;
    defaultLng?: number;
}

// Sub-component to handle map clicks
function LocationMarker({ lat, lng, onChange }: { lat: number | null, lng: number | null, onChange: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onChange(e.latlng.lat, e.latlng.lng);
        },
    });

    return lat !== null && lng !== null ? (
        <Marker position={[lat, lng]} />
    ) : null;
}

// Sub-component to handle auto-panning when lat/lng changes externally
function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

export default function MapPicker({ lat, lng, onChange, defaultLat = 23.7639, defaultLng = 90.4066 }: MapPickerProps) {
    const [initialCenter] = useState<[number, number]>([lat || defaultLat, lng || defaultLng]);

    return (
        <div className="w-full h-64 rounded-xl overflow-hidden border border-slate-700 shadow-inner relative group">
            <MapContainer 
                center={initialCenter} 
                zoom={15} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker lat={lat} lng={lng} onChange={onChange} />
                {lat && lng && <ChangeView center={[lat, lng]} />}
            </MapContainer>
            
            <div className="absolute bottom-2 right-2 z-[1000] bg-slate-900/80 backdrop-blur px-2 py-1 rounded text-[10px] text-slate-300 pointer-events-none border border-slate-700">
                Click map to set precise location
            </div>
        </div>
    );
}
