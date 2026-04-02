import { useState, useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import { api } from "@/services/api";

import iconShadow from "leaflet/dist/images/marker-shadow.png";

const UserPinIcon = new Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const HelperPinIcon = new Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], map.getZoom());
    }, [lat, lng, map]);
    return null;
}

interface BookingMapProps {
    onLocationChange: (lat: number, lng: number, address: string) => void;
}

export function BookingMap({ onLocationChange }: BookingMapProps) {
    const [position, setPosition] = useState<{ lat: number; lng: number }>({ lat: 12.9716, lng: 77.5946 }); // Default Bangalore
    const [helpers, setHelpers] = useState<any[]>([]);
    const [mockHelpers, setMockHelpers] = useState<any[]>([]);
    const [address, setAddress] = useState("Fetching your location...");
    const markerRef = useRef<any>(null);

    // Initial Geolocation
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    setPosition({ lat, lng });
                    updateAddress(lat, lng);
                },
                () => {
                    console.error("Geolocation failed, using default location.");
                    updateAddress(12.9716, 77.5946);
                }
            );
        } else {
            updateAddress(12.9716, 77.5946);
        }
    }, []);

    // Subscribe to live helpers
    useEffect(() => {
        const unsubscribe = api.subscribeToLiveHelpers((liveHelpers) => {
            setHelpers(liveHelpers);
        });
        return () => unsubscribe();
    }, []);

    // Generate Mock helpers if no live helpers found, just to populate the map for a lively look
    useEffect(() => {
        if (helpers.length === 0 && mockHelpers.length === 0) {
            const mocks = Array.from({ length: 4 }).map((_, i) => {
                const latOffset = (Math.random() - 0.5) * 0.04;
                const lngOffset = (Math.random() - 0.5) * 0.04;
                return {
                    id: `mock-${i}`,
                    name: `Verified Helper ${i + 1}`,
                    serviceType: ["Cleaning", "Plumbing", "Electrician", "Painting"][i % 4],
                    location: {
                        lat: position.lat + latOffset,
                        lng: position.lng + lngOffset
                    }
                };
            });
            setMockHelpers(mocks);
        } else if (helpers.length > 0) {
            setMockHelpers([]); // Clear mocks if we have real data
        }
    }, [helpers.length, position]);

    const displayHelpers = helpers.length > 0 ? helpers : mockHelpers;

    const updateAddress = async (lat: number, lng: number) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            const addr = data.display_name || "Unknown Location";
            setAddress(addr);
            onLocationChange(lat, lng, addr);
        } catch (error) {
            const fallback = "Failed to fetch address details";
            setAddress(fallback);
            onLocationChange(lat, lng, fallback);
        }
    };

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const newPos = marker.getLatLng();
                    setPosition({ lat: newPos.lat, lng: newPos.lng });
                    setAddress("Updating address...");
                    updateAddress(newPos.lat, newPos.lng);
                }
            },
        }),
        []
    );

    return (
        <div className="h-[400px] w-full rounded-2xl overflow-hidden border-2 border-border shadow-md relative z-0">
            <MapContainer
                center={[position.lat, position.lng]}
                zoom={14}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User Draggable Marker */}
                <Marker
                    position={[position.lat, position.lng]}
                    icon={UserPinIcon}
                    draggable={true}
                    eventHandlers={eventHandlers}
                    ref={markerRef}
                >
                    <Popup minWidth={200}>
                        <div className="font-sans text-sm">
                            <p className="font-bold text-base mb-1">Your Location</p>
                            <p className="text-muted-foreground text-xs">{address}</p>
                            <span className="text-blue-600 font-semibold text-xs mt-2 block">Drag pin to adjust</span>
                        </div>
                    </Popup>
                </Marker>

                {/* Helper Markers */}
                {displayHelpers.map((h) => {
                    if (!h.location?.lat) return null;
                    return (
                        <Marker key={h.id} position={[h.location.lat, h.location.lng]} icon={HelperPinIcon}>
                            <Popup>
                                <div className="font-sans text-sm p-1 text-center">
                                    <p className="font-bold">{h.name || "Helper"}</p>
                                    <p className="text-xs text-muted-foreground">{h.serviceType}</p>
                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1 inline-block">Online</span>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                <RecenterMap lat={position.lat} lng={position.lng} />
            </MapContainer>
        </div>
    );
}
