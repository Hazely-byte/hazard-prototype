'use client';

import { MapContainer, TileLayer, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Hazard, SEVERITY_COLORS, CATEGORY_LABELS } from '@/data/seedData';

// Fix Leaflet default marker icons in Next.js/webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapViewProps {
  hazards: Hazard[];
  center: [number, number];
  showClusters: boolean;
  routeCoordinates?: { coords: [number, number][]; color: string }[];
  userLocation?: [number, number] | null;
}

export default function MapView({ hazards, center, showClusters, routeCoordinates, userLocation }: MapViewProps) {
  return (
    <MapContainer
      center={center}
      zoom={13}
      className="h-full w-full"
      style={{ height: '100%', minHeight: '400px', zIndex: 0 }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {hazards.map((hazard) => {
        const severity = hazard.severity;
        const radius = severity === 'high' ? 12 : severity === 'medium' ? 9 : 6;
        const color = SEVERITY_COLORS[severity];

        return (
          <CircleMarker
            key={hazard.id}
            center={[hazard.location.lat, hazard.location.lng]}
            radius={radius}
            fillColor={color}
            color={color}
            fillOpacity={0.7}
            weight={2}
          >
            <Popup>
              <div className="font-sans">
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color }}>
                  {CATEGORY_LABELS[hazard.category]}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{hazard.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{hazard.location.address}</p>
                <div className="text-xs text-gray-500">{hazard.upvotes} upvotes</div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {routeCoordinates && routeCoordinates.map((route, idx) => (
        <Polyline
          key={idx}
          positions={route.coords}
          pathOptions={{ color: route.color, weight: 5, opacity: 0.8 }}
        />
      ))}

      {userLocation && (
        <CircleMarker
          center={userLocation}
          radius={8}
          fillColor="#3b82f6"
          color="#2563eb"
          fillOpacity={1}
          weight={2}
        >
          <Popup>Your Location</Popup>
        </CircleMarker>
      )}
    </MapContainer>
  );
}
