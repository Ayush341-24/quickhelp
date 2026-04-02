import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import { MapPin, Navigation, RefreshCw, AlertCircle, Zap } from "lucide-react";
import { api } from "@/services/api";

// Fix for Leaflet default marker icon
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// User Icon (Blue)
const UserIcon = new Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Helper Icon (Green/Gold/Red - let's go with Gold for "Premium/Quick")
const HelperIcon = new Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to recenter map when position changes
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo([lat, lng], map.getZoom());
    }, [lat, lng, map]);
    return null;
}

// Haversine Distance Calculation (km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

export function UserLocationMap() {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [helperPos, setHelperPos] = useState<{ lat: number; lng: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [address, setAddress] = useState<string | null>(null);

    const getLocation = () => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setLoading(false);
            return;
        }

        // Watch Position for Real-time updates
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const newPos = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                };
                setPosition(newPos);

                // Initialize Helper Position relative to User if not set
                if (!helperPos) {
                    // Random offset within ~1-2km
                    const latOffset = (Math.random() - 0.5) * 0.02;
                    const lngOffset = (Math.random() - 0.5) * 0.02;
                    setHelperPos({
                        lat: newPos.lat + latOffset,
                        lng: newPos.lng + lngOffset
                    });
                }

                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error("Watch position error:", err);
                if (!position) {
                    let msg = "Unable to retrieve your location.";
                    if (err.code === 1) msg = "Location permission denied. Please allow access.";
                    setError(msg);
                    setLoading(false);
                }
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    };

    // Simulate Helper Movement towards User (Real-time effect)
    useEffect(() => {
        if (!position || !helperPos) return;

        const interval = setInterval(() => {
            setHelperPos(prev => {
                if (!prev) return null;
                // Move 5% closer to user every second
                const latDiff = position.lat - prev.lat;
                const lngDiff = position.lng - prev.lng;

                // Stop if very close
                if (Math.abs(latDiff) < 0.0001 && Math.abs(lngDiff) < 0.0001) return prev;

                return {
                    lat: prev.lat + latDiff * 0.05,
                    lng: prev.lng + lngDiff * 0.05
                };
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [position]);

    // Calculate Distance whenever positions change
    useEffect(() => {
        if (position && helperPos) {
            const dist = calculateDistance(position.lat, position.lng, helperPos.lat, helperPos.lng);
            setDistance(dist);
        }
    }, [position, helperPos]);

    useEffect(() => {
        const cleanup = getLocation();
        return cleanup;
    }, []);

    // Reverse Geocoding & Backend Sync
    useEffect(() => {
        if (position) {
            const syncLocation = async () => {
                try {
                    await new Promise(r => setTimeout(r, 1000));
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`
                    );
                    const data = await response.json();
                    setAddress(data.display_name);
                    api.updateLocation(position).catch(() => { });
                } catch (error) {
                    console.error("Error updating location:", error);
                }
            };
            syncLocation();
        }
    }, [position]);

    const handleRetry = () => {
        setPosition(null);
        setAddress(null);
        getLocation();
    };

    if (error) {
        return (
            <div className="bg-destructive/10 text-destructive p-6 rounded-2xl border border-destructive/20 text-center flex flex-col items-center justify-center h-[400px]">
                <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-semibold mb-2">{error}</p>
                <button
                    onClick={handleRetry}
                    className="mt-4 px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" /> Try Again
                </button>
            </div>
        );
    }

    if (loading && !position) {
        return (
            <div className="bg-card p-8 rounded-2xl border border-border text-center h-[400px] flex flex-col items-center justify-center">
                <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <Navigation className="absolute inset-0 m-auto w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Locating you...</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    Please allow location access if prompted by your browser.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Address Banner */}
            <div className="bg-card border border-border p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Your Location</p>
                        <p className="text-sm font-medium truncate sm:text-base max-w-[200px] sm:max-w-xs">
                            {address || "Fetching precise address..."}
                        </p>
                    </div>
                </div>

                {distance !== null && (
                    <div className="flex items-center gap-3 bg-secondary/30 px-4 py-2 rounded-xl border border-border">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                            <Zap className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Helper is</p>
                            <p className="text-sm font-bold text-foreground">
                                {distance < 0.1 ? "Arriving now!" : `${distance.toFixed(2)} km away`}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="h-[400px] w-full rounded-2xl overflow-hidden border-2 border-border shadow-lg relative z-0">
                {position && (
                    <MapContainer
                        center={[position.lat, position.lng]}
                        zoom={15}
                        scrollWheelZoom={false}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* User Marker */}
                        <Marker position={[position.lat, position.lng]} icon={UserIcon}>
                            <Popup>
                                <div className="text-center p-2">
                                    <p className="font-bold text-sm">You</p>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Helper Marker */}
                        {helperPos && (
                            <>
                                <Marker position={[helperPos.lat, helperPos.lng]} icon={HelperIcon}>
                                    <Popup>
                                        <div className="text-center p-2">
                                            <p className="font-bold text-sm">Your Helper</p>
                                            <p className="text-xs text-muted-foreground">On the way...</p>
                                        </div>
                                    </Popup>
                                </Marker>
                                {/* Line connecting them */}
                                <Polyline
                                    positions={[
                                        [position.lat, position.lng],
                                        [helperPos.lat, helperPos.lng]
                                    ]}
                                    pathOptions={{ color: 'blue', dashArray: '10, 10', opacity: 0.6 }}
                                />
                            </>
                        )}

                        <RecenterMap lat={position.lat} lng={position.lng} />
                    </MapContainer>
                )}

                {/* Accuracy Overlay */}
                <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-border z-[1000] text-[10px] font-mono text-muted-foreground flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    GPS LIVE
                </div>
            </div>
        </div>
    );
}
