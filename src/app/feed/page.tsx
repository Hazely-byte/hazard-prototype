'use client';

import { useEffect, useState, useMemo } from 'react';
import { useHazardStore } from '@/store/hazardStore';
import HazardCard from '@/components/HazardCard';
import CategoryPills from '@/components/CategoryPills';
import WeatherAlert from '@/components/WeatherAlert';
import AlertsDrawer from '@/components/AlertsDrawer';
import BottomNav from '@/components/BottomNav';
import DemoControls from '@/components/DemoControls';
import ReportModal from '@/components/ReportModal';
import { Bell, Shield } from 'lucide-react';
import { Hazard } from '@/data/seedData';

export default function FeedPage() {
  const [mounted, setMounted] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  
  const hazards = useHazardStore((state) => state.hazards);
  const activeFilter = useHazardStore((state) => state.activeFilter);
  const setFilter = useHazardStore((state) => state.setFilter);
  const fetchSeedData = useHazardStore((state) => state.fetchSeedData);
  const alerts = useHazardStore((state) => state.alerts);
  const setUserLocation = useHazardStore((state) => state.setUserLocation);
  const userLocation = useHazardStore((state) => state.userLocation);
  const toggleUpvote = useHazardStore((state) => state.toggleUpvote);
  const userUpvotedHazardIds = useHazardStore((state) => state.userUpvotedHazardIds);
  const reportPost = useHazardStore((state) => state.reportPost);

  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const [hiddenReports, setHiddenReports] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    if (useHazardStore.getState().hazards.length === 0) {
      fetchSeedData();
    }

    // Handle deep-link from Map
    if (typeof window !== 'undefined' && hazards.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const activeId = params.get('activeId');
      if (activeId) {
        const hazard = hazards.find(h => h.id === activeId);
        if (hazard) {
          setSelectedHazard(hazard);
          // Clean up the URL so refresh doesn't reopen it
          window.history.replaceState(null, '', '/feed');
        }
      }
    }

    // Try to get real user GPS location for live distance meter
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // Keep default Raipur coordinates if permission denied or unavailable
        },
        { timeout: 5000 }
      );
    }
  }, [fetchSeedData, setUserLocation]);

  const activeCount = useMemo(() => hazards.filter((h) => h.status === 'active').length, [hazards]);
  const unreadAlertsCount = useMemo(() => alerts.filter((a) => !a.isRead).length, [alerts]);

  const filteredHazards = useMemo(() => {
    let filtered = hazards.filter(h => !hiddenReports.includes(h.id));

    if (activeFilter === 'all') {
      filtered = filtered.filter((h) => h.status !== 'resolved');
    } else if (activeFilter === 'resolved') {
      filtered = filtered.filter((h) => h.status === 'resolved');
    } else {
      filtered = filtered.filter((h) => h.category === activeFilter && h.status !== 'resolved');
    }

    const severityWeight: Record<string, number> = { high: 3, medium: 2, low: 1 };
    
    return filtered.sort((a, b) => {
      const scoreA = a.upvotes * (severityWeight[a.severity] || 1);
      const scoreB = b.upvotes * (severityWeight[b.severity] || 1);
      return scoreB - scoreA;
    });
  }, [hazards, activeFilter]);

  if (!mounted) return null;

  const categories = [
    { value: 'all', label: 'All', icon: '📋' },
    { value: 'pothole', label: 'Potholes', icon: '🕳️' },
    { value: 'broken-bridge', label: 'Bridges', icon: '🌉' },
    { value: 'hanging-wire', label: 'Electrical', icon: '⚡' },
    { value: 'waterlogging', label: 'Waterlogging', icon: '🌊' },
    { value: 'fallen-tree', label: 'Obstructions', icon: '🌳' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF5] pb-24 page-content">
      {/* Sticky App Header */}
      <div className="sticky top-0 bg-white/85 backdrop-blur-md border-b border-[#E2E8DC] px-4 py-3 z-30 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0">
            <img src="/logo.jpg" alt="SANKET Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="font-extrabold text-base text-[#192625] tracking-tight">SANKET</span>
          </div>
        </div>
        
        {/* Clickable Notification Bell with Badge */}
        <button
          onClick={() => setIsAlertsOpen(true)}
          className="relative p-2 rounded-full hover:bg-gray-100 transition-all active:scale-95 text-[#192625]"
          aria-label="Area alerts notification"
        >
          <Bell size={22} />
          {unreadAlertsCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm animate-pulse">
              {unreadAlertsCount}
            </span>
          )}
        </button>
      </div>

      {/* Proximity Pill */}
      <div className="bg-[#D4F67B]/20 text-[#4D6C1D] text-xs font-semibold px-4 py-2.5 rounded-full mx-4 mt-3 flex items-center justify-between border border-[#B5E342]/30">
        <div className="flex items-center gap-1.5">
          <span>📍</span>
          <span>Raipur, CG • <strong className="font-bold text-[#192625]">{activeCount}</strong> Active Hazards</span>
        </div>
        <span className="text-[10px] bg-white text-[#4D6C1D] px-2 py-0.5 rounded-full font-bold shadow-xs">
          LIVE
        </span>
      </div>

      {/* Calamity Weather Banner */}
      <div className="mt-3">
        <WeatherAlert />
      </div>

      {/* Category Pills */}
      <div className="mt-3 px-4">
        <CategoryPills 
          categories={categories}
          selected={activeFilter}
          onSelect={(val) => setFilter(val)}
        />
      </div>

      {/* Feed List */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-3 text-xs text-gray-500 font-medium">
          <span>{filteredHazards.length} Community Reports</span>
          <span>Sorted by Priority & Upvotes</span>
        </div>
        
        <div className="flex flex-col gap-4">
          {filteredHazards.map((hazard, i) => (
            <div 
              key={hazard.id} 
              className="animate-slide-up"
              style={{ animationDelay: `${Math.min(i * 60, 400)}ms` }}
            >
              <HazardCard hazard={hazard} onClick={() => setSelectedHazard(hazard)} />
            </div>
          ))}
        </div>
      </div>

      {/* Area Alerts Slide-over Drawer */}
      <AlertsDrawer 
        isOpen={isAlertsOpen} 
        onClose={() => setIsAlertsOpen(false)} 
      />

      <BottomNav />
      <DemoControls />

      <ReportModal
        hazard={selectedHazard}
        isOpen={!!selectedHazard}
        onClose={() => setSelectedHazard(null)}
        userLocation={userLocation}
        isUpvoted={selectedHazard ? userUpvotedHazardIds.includes(selectedHazard.id) : false}
        onUpvote={() => selectedHazard && toggleUpvote(selectedHazard.id)}
        onReportSubmit={(reason) => {
          if (selectedHazard) {
            setHiddenReports(prev => [...prev, selectedHazard.id]);
            reportPost(reason);
            setSelectedHazard(null);
          }
        }}
      />
    </div>
  );
}
