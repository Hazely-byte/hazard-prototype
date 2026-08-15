'use client';

import { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { useHazardStore } from '@/store/hazardStore';

export default function DemoControls() {
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const seedDemoData = useHazardStore((state) => state.seedDemoData);
  const simulateRapidUpvotes = useHazardStore((state) => state.simulateRapidUpvotes);
  const toggleWeatherAlert = useHazardStore((state) => state.toggleWeatherAlert);
  const simulateAI = useHazardStore((state) => state.simulateAI);
  const toggleSimulateAI = useHazardStore((state) => state.toggleSimulateAI);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 2000);
  };

  const handleAction = (action: () => void, message: string) => {
    action();
    showToast(message);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 bg-[#192625] text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
      >
        <Settings size={20} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 z-40 animate-in fade-in" 
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-72 bg-white shadow-2xl z-50 p-6 flex flex-col animate-in slide-in-from-right duration-300 transform transition-all">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#192625]">Demo Controls</h2>
                <p className="text-xs text-gray-500">🎛️ Expo Toolkit</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
              <button
                onClick={() => handleAction(seedDemoData, 'Data seeded!')}
                className="bg-[#D4F67B] text-[#192625] rounded-xl py-3 px-4 font-semibold w-full active:scale-95 transition-all text-sm text-left flex items-center gap-2"
              >
                <span>🌱</span> Seed Presentation Hazards
              </button>

              <button
                onClick={() => handleAction(simulateRapidUpvotes, 'Upvotes simulated!')}
                className="bg-amber-100 text-amber-800 rounded-xl py-3 px-4 font-semibold w-full active:scale-95 transition-all text-sm text-left flex items-center gap-2"
              >
                <span>⚡</span> Simulate Rapid Upvotes
              </button>

              <button
                onClick={() => handleAction(() => toggleWeatherAlert(), 'Weather calamity toggled!')}
                className="bg-red-100 text-red-700 rounded-xl py-3 px-4 font-semibold w-full active:scale-95 transition-all text-sm text-left flex items-center gap-2"
              >
                <span>🌧️</span> Simulate Weather Calamity
              </button>

              <button
                onClick={() => handleAction(toggleSimulateAI, `AI Simulation: ${!simulateAI ? 'ON' : 'OFF'}`)}
                className={`${simulateAI ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'} rounded-xl py-3 px-4 font-semibold w-full active:scale-95 transition-all text-sm text-left flex items-center gap-2`}
              >
                <span>🤖</span> AI Simulation: {simulateAI ? 'ON' : 'OFF'}
              </button>
            </div>

            {toastMessage && (
              <div className="mt-4 p-3 bg-gray-800 text-white text-sm rounded-lg text-center animate-in fade-in slide-in-from-bottom-2">
                {toastMessage}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
