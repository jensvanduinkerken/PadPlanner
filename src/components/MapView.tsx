import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { LatLng } from '../types/route';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  center?: LatLng | null;
  routeCoordinates?: LatLng[] | null;
  isLoading?: boolean;
}

// Fix for Leaflet default marker icons
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.setIcon(defaultIcon);

export function MapView({ center, routeCoordinates, isLoading }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current).setView([52.37, 4.89], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance.current);
  }, []);

  // Update map center and add marker
  useEffect(() => {
    if (mapInstance.current && center) {
      mapInstance.current.setView([center.lat, center.lng], 14);

      if (markerRef.current) {
        markerRef.current.remove();
      }

      markerRef.current = L.marker([center.lat, center.lng], {
        icon: defaultIcon,
        title: 'Start/End Point',
      }).addTo(mapInstance.current);
    }
  }, [center]);

  // Update route polyline
  useEffect(() => {
    if (!mapInstance.current) return;

    if (polylineRef.current) {
      polylineRef.current.remove();
    }

    if (routeCoordinates && routeCoordinates.length > 0) {
      const latlngs = routeCoordinates.map((p) => [p.lat, p.lng] as [number, number]);

      polylineRef.current = L.polyline(latlngs, {
        color: '#2563EB',
        weight: 5,
        opacity: 0.8,
      }).addTo(mapInstance.current);

      // Fit map to route bounds
      const bounds = L.latLngBounds(latlngs);
      mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routeCoordinates]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" aria-label="Walking route map" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            <p className="text-gray-700 text-sm">Generating route...</p>
          </div>
        </div>
      )}
    </div>
  );
}
