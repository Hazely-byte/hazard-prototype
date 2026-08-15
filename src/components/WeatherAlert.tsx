'use client';

import { X, CloudRain } from 'lucide-react';
import { useHazardStore } from '@/store/hazardStore';

export default function WeatherAlert() {
  const weatherAlertActive = useHazardStore((state) => state.weatherAlertActive);
  const weatherAlertMessage = useHazardStore((state) => state.weatherAlertMessage) || 'Severe weather conditions reported in your area.';
  const toggleWeatherAlert = useHazardStore((state) => state.toggleWeatherAlert);

  if (!weatherAlertActive) return null;

  return (
    <div className="animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-red-500 text-white rounded-2xl p-4 mx-4 my-2 shadow-lg">
        <div className="absolute inset-0 bg-white/10 animate-pulse mix-blend-overlay" />
        <div className="relative flex items-start gap-3">
          <CloudRain size={24} className="mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-sm">Weather Alert</h3>
            <p className="text-xs opacity-90 mt-1">{weatherAlertMessage}</p>
          </div>
          <button
            onClick={() => toggleWeatherAlert()}
            className="p-1 hover:bg-white/20 rounded-full transition-colors active:scale-95"
            aria-label="Dismiss alert"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
