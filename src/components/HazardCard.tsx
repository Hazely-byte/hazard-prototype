'use client';

import { useState } from 'react';
import { MapPin, ArrowBigUp, Navigation } from 'lucide-react';
import { Hazard, CATEGORY_LABELS, CATEGORY_ICONS } from '@/data/seedData';
import { useHazardStore } from '@/store/hazardStore';
import { calculateDistance, formatDistance } from '@/lib/geocode';

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return `${Math.floor(diffInDays / 7)}w ago`;
}

export default function HazardCard({ hazard }: { hazard: Hazard }) {
  const userUpvotedHazardIds = useHazardStore((state) => state.userUpvotedHazardIds);
  const toggleUpvote = useHazardStore((state) => state.toggleUpvote);
  const userLocation = useHazardStore((state) => state.userLocation);
  
  const [isAnimating, setIsAnimating] = useState(false);

  const isUpvoted = userUpvotedHazardIds?.includes(hazard.id) ?? false;

  const handleUpvoteToggle = () => {
    setIsAnimating(true);
    toggleUpvote(hazard.id);
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Calculate dynamic distance from user coordinates to hazard coordinates
  const distanceKm = userLocation && hazard.location
    ? calculateDistance(userLocation.lat, userLocation.lng, hazard.location.lat, hazard.location.lng)
    : 0.8;
  const formattedDistance = formatDistance(distanceKm);

  const severityConfig = {
    low: { bg: 'bg-green-500', text: 'text-green-700', label: 'Low' },
    medium: { bg: 'bg-amber-500', text: 'text-amber-700', label: 'Medium' },
    high: { bg: 'bg-red-500', text: 'text-red-700', label: 'High' },
  };

  const sev = severityConfig[hazard.severity];
  const categoryLabel = CATEGORY_LABELS[hazard.category] || hazard.category;
  const categoryIcon = CATEGORY_ICONS?.[hazard.category] || '📋';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8DC] overflow-hidden transition-all hover:shadow-md">
      {/* Image */}
      {hazard.imageUrl && (
        <div className="h-40 w-full relative overflow-hidden bg-slate-900">
          <img
            src={hazard.imageUrl}
            alt={hazard.title}
            className="w-full h-full object-cover"
          />
          {hazard.status === 'resolved' && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              ✓ Resolved
            </div>
          )}
          {hazard.status === 'under-review' && (
            <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              Under Review
            </div>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category & Severity */}
        <div className="flex items-center justify-between">
          <span className="bg-[#D4F67B]/20 text-[#4D6C1D] text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1">
            <span>{categoryIcon}</span>
            {categoryLabel}
          </span>
          <div className="flex items-center gap-1.5 text-xs font-medium capitalize">
            <div className={`w-2 h-2 rounded-full ${sev.bg}`} />
            <span className={sev.text}>{sev.label}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[#192625] text-sm leading-snug">
          {hazard.title}
        </h3>

        {/* Location & Dynamic Distance Meter */}
        <div className="flex items-center justify-between text-xs text-gray-500 gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <MapPin size={13} className="shrink-0 text-[#6A9325]" />
            <span className="truncate text-gray-700">{hazard.location.address}</span>
          </div>
          <span className="inline-flex items-center gap-1 bg-[#F8FAF5] border border-[#E2E8DC] text-[#4D6C1D] font-medium px-2 py-0.5 rounded-md shrink-0 text-[11px]">
            <Navigation size={10} className="rotate-45" />
            {formattedDistance}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E2E8DC]">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-400">
              {getRelativeTime(hazard.timestamp)}
            </span>
            <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              ⭐ {hazard.reporterPoints} pts
            </span>
          </div>
          
          {/* Toggleable Upvote CTA */}
          <button
            onClick={handleUpvoteToggle}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all active:scale-95 border ${
              isUpvoted 
                ? 'bg-[#D4F67B] text-[#192625] border-[#B5E342] font-semibold shadow-sm' 
                : 'text-gray-600 bg-[#F8FAF5] border-[#E2E8DC] hover:bg-[#D4F67B]/20 hover:border-[#B5E342]'
            } ${isAnimating ? 'animate-bounce-up scale-105' : ''}`}
            title={isUpvoted ? 'Click to undo upvote' : 'Click to upvote priority'}
          >
            <ArrowBigUp 
              size={18} 
              className={`transition-all duration-200 ${
                isUpvoted ? 'fill-[#192625] text-[#192625]' : 'text-gray-500'
              }`} 
            />
            <span>{hazard.upvotes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
