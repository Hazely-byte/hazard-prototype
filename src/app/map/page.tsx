'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, Shield, AlertTriangle, ChevronDown, ChevronUp, Clock, Route as RouteIcon, Layers } from 'lucide-react';
import { useHazardStore } from '@/store/hazardStore';
import BottomNav from '@/components/BottomNav';
import DemoControls from '@/components/DemoControls';
import { SEVERITY_COLORS, DEMO_ROUTE } from '@/data/seedData';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#F8FAF5] flex items-center justify-center"><div className="text-gray-400 text-sm">Loading map...</div></div>,
});

export default function MapPage() {
  const [mounted, setMounted] = useState(false);
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [showClusters, setShowClusters] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const hazards = useHazardStore((state) => state.hazards);
  const activeHazards = hazards.filter(h => h.status !== 'resolved');

  useEffect(() => {
    setMounted(true);
    // Simulate getting user location
    setUserLocation([21.2494, 81.6280]);
  }, []);

  const routeCoordinates = useMemo(() => {
    if (!selectedRouteId) return [];
    const route = DEMO_ROUTE.routes.find(r => r.id === selectedRouteId);
    if (!route) return [];
    
    return [{ coords: route.coordinates, color: route.color }];
  }, [selectedRouteId]);

  if (!mounted) return null;

  return (
    <div className="h-screen w-full flex flex-col relative bg-[#F8FAF5] overflow-hidden">
      {/* Main Map Area */}
      <div className="flex-1 w-full relative z-0 h-[calc(100dvh-5rem)]">
        <MapView 
          hazards={activeHazards}
          center={[21.2514, 81.6296]}
          showClusters={showClusters}
          routeCoordinates={routeCoordinates}
          userLocation={userLocation}
        />

        {/* Floating Top Bar */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000]">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-md flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#EF4444]" />
            <span className="text-sm font-medium text-[#192625]">Raipur, Chhattisgarh</span>
          </div>
        </div>

        {/* Toggle Buttons */}
        <div className="absolute top-24 right-4 z-[1000] flex flex-col gap-3">
          <button 
            onClick={() => setShowClusters(!showClusters)}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors ${showClusters ? 'bg-[#D4F67B] text-[#192625]' : 'bg-white text-gray-600'}`}
          >
            <Layers className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowRoutePanel(!showRoutePanel)}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors ${showRoutePanel ? 'bg-[#D4F67B] text-[#192625]' : 'bg-white text-gray-600'}`}
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* SafeRoute Panel */}
      <div 
        className={`absolute bottom-20 left-0 right-0 z-[1000] bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-in-out ${showRoutePanel ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="p-5 pb-8">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
          
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
              const isDangerous = route.dangerScore > 6;
              
              return (
                <div 
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${isSelected ? 'border-[#B5E342] bg-[#F8FAF5]' : 'border-[#E2E8DC] bg-white'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm text-[#192625]">{route.name}</h3>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${isSafe ? 'bg-green-100 text-green-800' : isWarning ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                      {isSafe ? <Shield className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      <span>{route.dangerScore}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {route.duration}</div>
                    <div>{route.distance}</div>
                    <div className="text-xs">{route.hazardCount} hazards</div>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    {route.hazardBreakdown}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNav />
      <DemoControls />
    </div>
  );
}
