'use client';

import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: number;
}

export default function CelebrationModal({ isOpen, onClose, points }: CelebrationModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm mx-6 text-center shadow-2xl animate-in zoom-in-90 duration-300 relative overflow-hidden transform transition-all scale-100 opacity-100">
        
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-2 h-2 rounded-full animate-ping"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ['#D4F67B', '#6A9325', '#22C55E', '#F59E0B'][Math.floor(Math.random() * 4)],
                  animationDuration: `${Math.random() * 1 + 0.5}s`,
                  animationDelay: `${Math.random() * 0.5}s`
                }}
              />
            ))}
          </div>
        )}

        <div className="bg-[#D4F67B] rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
          <Check size={40} className="text-[#192625]" />
        </div>
        
        <h2 className="text-xl font-bold text-[#192625] mt-4 mb-2">
          Report Submitted!
        </h2>
        
        <div className="inline-block bg-[#D4F67B]/20 text-[#4D6C1D] font-bold text-sm px-4 py-1.5 rounded-full mb-3 animate-bounce">
          +{points} Civic Points
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          Your report has been verified and submitted.
        </p>
        
        <button
          onClick={onClose}
          className="w-full bg-[#192625] text-white rounded-full py-3 px-8 font-semibold mt-6 active:scale-95 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
}
