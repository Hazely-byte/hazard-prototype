'use client';

import { MapContainer, TileLayer, Popup, Polyline, Marker, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Hazard, SEVERITY_COLORS, CATEGORY_LABELS, CATEGORY_ICONS, HazardCategory } from '@/data/seedData';
import { useEffect, useState } from 'react';
import { Navigation as NavigationIcon } from 'lucide-react';

// Fix Leaflet default marker icons in Next.js/webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// --- Custom Hazard Pin Icon (emoji centered inside SVG pin) ---
function createHazardIcon(category: HazardCategory, severity: string): L.DivIcon {
  const emoji = CATEGORY_ICONS[category] || '⚠️';
  const borderColor = severity === 'high' ? '#EF4444' : severity === 'medium' ? '#F59E0B' : '#22C55E';
  const bgFill = severity === 'high' ? '#FEF2F2' : severity === 'medium' ? '#FFFBEB' : '#ECFDF5';

  const htmlString = '<div style="position:relative;width:44px;height:54px;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.3));">' +
    '<svg width="44" height="54" viewBox="0 0 44 54" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M22 52C22 52 41 34 41 20C41 9.5 32.5 1 22 1C11.5 1 3 9.5 3 20C3 34 22 52 22 52Z" fill="' + bgFill + '" stroke="' + borderColor + '" stroke-width="2.5"/>' +
    '<circle cx="22" cy="20" r="14" fill="white" stroke="' + borderColor + '" stroke-width="1.5"/>' +
    '</svg>' +
    '<span style="position:absolute;top:11px;left:0;right:0;text-align:center;font-size:18px;line-height:20px;pointer-events:none;">' + emoji + '</span>' +
    '</div>';

  return L.divIcon({
    className: 'hazard-pin-icon',
    html: htmlString,
    iconSize: [44, 54],
    iconAnchor: [22, 54],
    popupAnchor: [0, -54],
  });
}

// --- Fly-to helper component ---
function FlyToLocation({ location }: { location: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo(location, 16, { duration: 1.2 });
    }
  }, [location, map]);
  return null;
}

interface MapViewProps {
  hazards: Hazard[];
  center: [number, number];
  routeCoordinates?: { coords: [number, number][]; color: string }[];
  userLocation?: [number, number] | null;
  flyToTarget?: [number, number] | null;
  onNavigateClick?: (hazard: Hazard) => void;
  onViewDetailsClick?: (hazard: Hazard) => void;
}

export default function MapView({ hazards, center, routeCoordinates, userLocation, flyToTarget, onNavigateClick, onViewDetailsClick }: MapViewProps) {
  // Stable key that changes only on full remount — prevents Leaflet "container already initialized" error on HMR
  const [mapKey] = useState(() => Date.now());

  return (
    <MapContainer
      key={mapKey}
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

      {/* Fly-to controller */}
      <FlyToLocation location={flyToTarget || null} />

      {/* Hazard Pin Markers */}
      {hazards.map((hazard) => {
        const icon = createHazardIcon(hazard.category, hazard.severity);
        const severityColor = SEVERITY_COLORS[hazard.severity];

        return (
          <Marker
            key={hazard.id}
            position={[hazard.location.lat, hazard.location.lng]}
            icon={icon}
          >
            <Popup>
              <div className="font-sans min-w-[140px] text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1.5">
                  <span className="text-lg">{CATEGORY_ICONS[hazard.category]}</span>
                  <span className="text-sm font-bold tracking-tight text-gray-900">
                    {CATEGORY_LABELS[hazard.category]}
                  </span>
                </div>
                <div className="mb-2">
                  <span
                    className="px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: `${severityColor}15`, color: severityColor }}
                  >
                    {hazard.severity} Risk
                  </span>
                </div>

                {/* Only show View Details for user-submitted hazards (data: image or specific logic) */}
                {hazard.imageUrl?.startsWith('data:') && onViewDetailsClick && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetailsClick(hazard);
                    }}
                    className="mt-2 w-full bg-[#192625] text-white font-semibold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
                  >
                    View Details
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Route Polylines */}
      {routeCoordinates && routeCoordinates.map((route, idx) => (
        <Polyline
          key={idx}
          positions={route.coords}
          pathOptions={{ color: route.color, weight: 5, opacity: 0.8 }}
        />
      ))}

      {/* User Location Blue Pulse Dot */}
      {userLocation && (
        <>
          <CircleMarker
            center={userLocation}
            radius={16}
            fillColor="#3b82f6"
            color="transparent"
            fillOpacity={0.15}
            weight={0}
          />
          <CircleMarker
            center={userLocation}
            radius={7}
            fillColor="#3b82f6"
            color="#ffffff"
            fillOpacity={1}
            weight={3}
          >
            <Popup>
              <span className="font-sans text-sm font-semibold text-blue-600">📍 You are here</span>
            </Popup>
          </CircleMarker>
        </>
      )}
    </MapContainer>
  );
}
