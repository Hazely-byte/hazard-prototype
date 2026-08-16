'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  MapPin, Navigation, Shield, AlertTriangle,
  Clock, Route as RouteIcon, X,
  ChevronLeft, Crosshair, Loader2,
} from 'lucide-react';
import { useHazardStore } from '@/store/hazardStore';
import BottomNav from '@/components/BottomNav';
import DemoControls from '@/components/DemoControls';
import { SEVERITY_COLORS, DEMO_ROUTE, CATEGORY_LABELS, CATEGORY_ICONS, HazardCategory } from '@/data/seedData';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#F8FAF5] flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading map...</div>
    </div>
  ),
});

// Category filter options
const FILTER_OPTIONS: { value: HazardCategory | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '🗺️' },
  { value: 'pothole', label: 'Potholes', emoji: '🕳️' },
  { value: 'broken-bridge', label: 'Bridges', emoji: '🌉' },
  { value: 'hanging-wire', label: 'Electrical', emoji: '⚡' },
  { value: 'waterlogging', label: 'Waterlogging', emoji: '🌊' },
  { value: 'fallen-tree', label: 'Obstructions', emoji: '🌳' },
  { value: 'other', label: 'Other', emoji: '⚠️' },
];

export default function MapPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [flyToTarget, setFlyToTarget] = useState<[number, number] | null>(null);
  const [locatingMe, setLocatingMe] = useState(false);
  const [activeFilter, setActiveFilter] = useState<HazardCategory | 'all'>('all');

  const hazards = useHazardStore((state) => state.hazards);
  const activeHazards = hazards.filter(h => h.status !== 'resolved');

  // Filter hazards by selected category
  const filteredHazards = useMemo(() => {
    if (activeFilter === 'all') return activeHazards;
    return activeHazards.filter(h => h.category === activeFilter);
  }, [activeHazards, activeFilter]);

  // Category counts for badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: activeHazards.length };
    for (const h of activeHazards) {
      counts[h.category] = (counts[h.category] || 0) + 1;
    }
    return counts;
  }, [activeHazards]);

  useEffect(() => {
    setMounted(true);
    setUserLocation([21.2494, 81.6280]);
  }, []);

  const routeCoordinates = useMemo(() => {
    if (!selectedRouteId) return [];
    const route = DEMO_ROUTE.routes.find(r => r.id === selectedRouteId);
    if (!route) return [];
    return [{ coords: route.coordinates, color: route.color }];
  }, [selectedRouteId]);

  // Locate Me — grab real GPS
  const handleLocateMe = useCallback(() => {
    if (!navigator?.geolocation) return;
    setLocatingMe(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setFlyToTarget(coords);
        setLocatingMe(false);
        setTimeout(() => setFlyToTarget(null), 1500);
      },
      () => {
        const fallback: [number, number] = [21.2494, 81.6280];
        setFlyToTarget(fallback);
        setLocatingMe(false);
        setTimeout(() => setFlyToTarget(null), 1500);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-screen w-full flex flex-col relative bg-[#F8FAF5] overflow-hidden">
      {/* Main Map Area */}
      <div className="flex-1 w-full relative z-0 h-[calc(100dvh-5rem)]">
        <MapView
          hazards={filteredHazards}
          center={[21.2514, 81.6296]}
          routeCoordinates={routeCoordinates}
          userLocation={userLocation}
          flyToTarget={flyToTarget}
          onNavigateClick={() => setShowRoutePanel(true)}
          onViewDetailsClick={(hazard) => {
            router.push(`/feed?activeId=${hazard.id}`);
          }}
        />

        {/* ===== FLOATING UI CONTROLS ===== */}

        {/* Back Button (top-left) */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-4 z-[1000] w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-[#192625] active:scale-95 transition-all hover:bg-white"
          aria-label="Go back"
        >
          <ChevronLeft size={22} />
        </button>

        {/* City Label (top-center) */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000]">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-md flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#EF4444]" />
            <span className="text-sm font-medium text-[#192625]">Raipur, CG</span>
            <span className="text-[10px] font-bold text-[#4D6C1D] bg-[#D4F67B]/40 px-1.5 py-0.5 rounded-full">
              {activeHazards.length} active
            </span>
          </div>
        </div>

        {/* ===== CATEGORY FILTER BAR (below header row) ===== */}
        <div className="absolute top-[4.5rem] left-0 right-0 z-[1000] px-3">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg px-2 py-2 overflow-x-auto hide-scrollbar">
            <div className="flex gap-1.5 min-w-max">
              {FILTER_OPTIONS.map((opt) => {
                const isActive = activeFilter === opt.value;
                const count = categoryCounts[opt.value] ?? 0;

                return (
                  <button
                    key={opt.value}
                    onClick={() => setActiveFilter(opt.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                      isActive
                        ? 'bg-[#192625] text-[#D4F67B] shadow-sm'
                        : 'bg-[#F8FAF5] text-[#192625] hover:bg-[#E2E8DC]'
                    }`}
                  >
                    <span className="text-sm">{opt.emoji}</span>
                    <span>{opt.label}</span>
                    {count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-[#D4F67B]/30 text-[#D4F67B]'
                          : 'bg-[#E2E8DC] text-[#4D6C1D]'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top-Right Floating Button (SafeRoute) */}
        <div className="absolute top-48 right-4 z-[1000]">
          <button
            onClick={() => setShowRoutePanel(true)}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors bg-white text-gray-600 hover:bg-[#F8FAF5] hover:text-[#4D6C1D] active:scale-95 border border-[#E2E8DC]"
            aria-label="Open SafeRoute"
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>

        {/* Locate Me Button (bottom-right, above bottom nav) */}
        <button
          onClick={handleLocateMe}
          disabled={locatingMe}
          className="absolute bottom-32 right-4 z-[1000] w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-[#4D6C1D] active:scale-95 transition-all hover:bg-[#F8FAF5] border border-[#E2E8DC] disabled:opacity-50"
          aria-label="Locate me"
        >
          {locatingMe ? (
            <Loader2 size={22} className="animate-spin text-[#4D6C1D]" />
          ) : (
            <Crosshair size={22} />
          )}
        </button>
      </div>

      {/* SafeRoute Panel — strictly conditionally rendered */}
      {showRoutePanel && (
        <div
          className="absolute bottom-20 left-0 right-0 z-[1001] bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-full duration-300 ease-out"
        >
        <div className="p-5 pb-8">
          {/* Drag handle + close button */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            <button
              onClick={() => { setShowRoutePanel(false); setSelectedRouteId(null); }}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 active:scale-95 transition-all"
              aria-label="Close SafeRoute"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <RouteIcon className="w-5 h-5 text-[#6A9325]" />
            <h2 className="text-base font-bold text-[#192625]">SafeRoute Navigator</h2>
          </div>

          <div className="space-y-3 mb-5">
            <div className="relative">
              <div className="absolute left-3 top-3"><MapPin className="w-4 h-4 text-gray-400" /></div>
              <input type="text" value="Shankar Nagar" readOnly className="w-full bg-gray-50 border border-[#E2E8DC] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none" />
            </div>
            <div className="relative">
              <div className="absolute left-3 top-3"><Navigation className="w-4 h-4 text-[#3b82f6]" /></div>
              <input type="text" value="NIT Raipur" readOnly className="w-full bg-gray-50 border border-[#E2E8DC] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none" />
            </div>
          </div>

          <div className="space-y-3 max-h-[40vh] overflow-y-auto hide-scrollbar pb-2">
            {DEMO_ROUTE.routes.map((route) => {
              const isSelected = selectedRouteId === route.id;
              const isSafe = route.dangerScore <= 3;
              const isWarning = route.dangerScore > 3 && route.dangerScore <= 6;

              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${
                    isSelected ? 'border-[#B5E342] bg-[#F8FAF5]' : 'border-[#E2E8DC] bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm text-[#192625]">{route.name}</h3>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                      isSafe ? 'bg-green-100 text-green-800' : isWarning ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isSafe ? <Shield className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      <span>{route.dangerScore}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {route.duration}</div>
                    <div>{route.distance}</div>
                    <div className="text-xs">{route.hazardCount} hazards</div>
                  </div>

                  <p className="text-xs text-gray-500">{route.hazardBreakdown}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      <BottomNav />
      <DemoControls />
    </div>
  );
}
