'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useHazardStore } from '@/store/hazardStore';
import CategoryPills from '@/components/CategoryPills';
import SeverityToggle from '@/components/SeverityToggle';
import CelebrationModal from '@/components/CelebrationModal';
import BottomNav from '@/components/BottomNav';
import DemoControls from '@/components/DemoControls';
import { Camera, MapPin, Send, AlertTriangle, X, Loader2, ShieldCheck, RefreshCw } from 'lucide-react';
import { reverseGeocode } from '@/lib/geocode';
import { Severity, HazardCategory, CATEGORY_LABELS } from '@/data/seedData';

// Canvas-based image compression: max 400x300 at 0.6 JPEG quality (~20-30KB)
async function compressImage(dataUrl: string, maxWidth = 400, maxHeight = 300, quality = 0.6): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Maintain aspect ratio while bounding within maxWidth/maxHeight
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export default function ReportPage() {
  const [mounted, setMounted] = useState(false);
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [category, setCategory] = useState<HazardCategory | ''>('');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showRejection, setShowRejection] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchLocation = useCallback(() => {
    setGeoLoading(true);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const address = await reverseGeocode(latitude, longitude);
            setLocation({ lat: latitude, lng: longitude, address });
          } catch (error) {
            console.error('Geocoding error', error);
            setLocation({ lat: position.coords.latitude, lng: position.coords.longitude, address: 'VIP Road, Raipur' });
          } finally {
            setGeoLoading(false);
          }
        },
        (error) => {
          console.warn('Geolocation fallback used (ignoring error for demo):', error.message);
          setLocation({ lat: 21.2514, lng: 81.6296, address: 'Raipur, Chhattisgarh' });
          setGeoLoading(false);
        },
        { timeout: 6000 }
      );
    } else {
      setLocation({ lat: 21.2514, lng: 81.6296, address: 'Raipur, Chhattisgarh' });
      setGeoLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setShowRejection(false);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawBase64 = reader.result as string;
        // Pre-compress to keep memory lightweight right from capture
        const compressed = await compressImage(rawBase64, 400, 300, 0.6);
        setCapturedImage(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setCapturedImage(null);
    setCategory('');
    setSeverity('medium');
    setDescription('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowCelebration(false);
    setShowRejection(false);
  };

  async function handleSubmit() {
    if (!capturedImage || !category || isSubmitting) return;
    setIsSubmitting(true);
    setShowRejection(false);

    try {
      // Compress thumbnail before sending and saving to storage
      const finalImage = await compressImage(capturedImage, 400, 300, 0.6);

      // Always call the real Gemini API — no simulation bypass
      const res = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: finalImage,
          description,
          category,
        }),
      });

      const result = await res.json();
      
      if (result.approved) {
        // AI approved -> add hazard with compressed thumbnail to store and trigger reward
        useHazardStore.getState().addHazard({
          category: category as HazardCategory,
          severity,
          title: `${CATEGORY_LABELS[category as HazardCategory]} near ${location?.address?.split(',')[0] || 'Raipur'}`,
          description: description || `Reported ${CATEGORY_LABELS[category as HazardCategory]} requiring civic maintenance.`,
          location: location || { lat: 21.2514, lng: 81.6296, address: 'VIP Road, Raipur, CG' },
          imageUrl: finalImage,
        });
        setShowCelebration(true);
      } else {
        // AI rejected -> show strict rejection banner, do not save or award points
        setRejectionReason(result.reason || 'AI validation failed: Image does not contain a verified road hazard.');
        setShowRejection(true);
      }
    } catch (e) {
      console.error(e);
      setRejectionReason('Network error occurred while contacting AI validator. Please retry.');
      setShowRejection(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!mounted) return null;

  const categories = [
    { value: 'pothole', label: 'Pothole', icon: '🕳️' },
    { value: 'broken-bridge', label: 'Broken Bridge', icon: '🌉' },
    { value: 'hanging-wire', label: 'Hanging Wire', icon: '⚡' },
    { value: 'streetlight', label: 'Streetlight', icon: '💡' },
    { value: 'fallen-tree', label: 'Fallen Tree', icon: '🌳' },
    { value: 'waterlogging', label: 'Waterlogging', icon: '🌊' },
    { value: 'other', label: 'Other Hazard', icon: '⚠️' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF5] pb-24 page-content relative">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#E2E8DC] px-4 py-3.5 z-30 flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-lg text-[#192625]">Report Public Hazard</h1>
          <p className="text-[11px] text-gray-500 font-medium">Smart City AI Verification Gate</p>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#4D6C1D] bg-[#D4F67B]/30 px-2.5 py-1 rounded-full border border-[#B5E342]/40">
          <ShieldCheck size={14} />
          <span>+50 Pts</span>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Rejection Alert Banner */}
        {showRejection && (
          <div className="bg-red-50 border-2 border-red-400 text-red-900 rounded-2xl p-4 shadow-md flex items-start gap-3 animate-slide-down">
            <AlertTriangle size={24} className="text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-sm text-red-900">AI Validation Rejected</h3>
              <p className="text-xs mt-1 text-red-800 leading-relaxed">{rejectionReason}</p>
              <p className="text-[11px] text-red-600 font-medium mt-2">
                ⚠️ Guidelines: Only real-world photos of public road hazards and infrastructure damage are accepted. Video games, screenshots, selfies, indoor objects, and spam text will be rejected.
              </p>
            </div>
            <button 
              onClick={() => setShowRejection(false)} 
              className="text-red-400 hover:text-red-700 p-1 rounded-full"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Live Camera Box */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
            1. Live Camera Capture <span className="text-red-500">*</span>
          </label>
          
          <div 
            className={`relative border-2 border-dashed rounded-2xl h-52 flex flex-col items-center justify-center bg-white overflow-hidden cursor-pointer transition-all ${
              capturedImage 
                ? 'border-[#6A9325] shadow-sm' 
                : 'border-[#E2E8DC] hover:border-[#B5E342] hover:bg-[#F8FAF5]'
            }`}
            onClick={() => !capturedImage && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={fileInputRef}
              className="hidden" 
              onChange={handleImageCapture}
            />
            
            {capturedImage ? (
              <>
                <img src={capturedImage} alt="Captured hazard" className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-[#D4F67B] text-[#192625] text-xs px-3 py-1 rounded-full font-bold shadow-md flex items-center gap-1">
                  <span>✓</span> Live Photo Ready
                </div>
                <button 
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full shadow-md text-gray-700 hover:bg-white active:scale-95 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCapturedImage(null);
                    setShowRejection(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  title="Retake photo"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <div className="text-center p-6 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#F8FAF5] border border-[#E2E8DC] flex items-center justify-center text-gray-500 mb-3">
                  <Camera size={26} className="text-[#192625]" />
                </div>
                <p className="font-bold text-sm text-[#192625]">Tap to Capture Live Hazard</p>
                <p className="text-[11px] text-gray-400 mt-1">Real-time camera photo required for AI validation</p>
              </div>
            )}
          </div>
        </div>

        {/* Auto Geotagging Pill */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
            2. Verified Geolocation
          </label>
          <div className="bg-white border border-[#E2E8DC] rounded-xl px-4 py-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 text-xs text-[#192625] min-w-0 flex-1">
              {geoLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-gray-400 shrink-0" />
                  <span className="text-gray-500">Resolving street coordinates...</span>
                </>
              ) : location ? (
                <>
                  <MapPin size={16} className="text-[#6A9325] shrink-0" />
                  <span className="truncate font-medium">{location.address}</span>
                </>
              ) : (
                <>
                  <MapPin size={16} className="text-gray-400 shrink-0" />
                  <span className="text-gray-500">Location unavailable</span>
                </>
              )}
            </div>
            {!geoLoading && (
              <button 
                onClick={fetchLocation} 
                className="text-xs text-[#4D6C1D] font-semibold hover:underline flex items-center gap-1 shrink-0 ml-2"
                title="Refresh location"
              >
                <RefreshCw size={12} />
                Refresh
              </button>
            )}
          </div>
        </div>

        {/* Category Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
            3. Hazard Category <span className="text-red-500">*</span>
          </label>
          <CategoryPills 
            categories={categories}
            selected={category}
            onSelect={(val) => {
              setShowRejection(false);
              setCategory(val as HazardCategory);
            }}
          />
        </div>

        {/* Severity Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
            4. Perceived Severity
          </label>
          <SeverityToggle 
            value={severity}
            onChange={setSeverity}
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
            5. Description & Context
          </label>
          <textarea 
            className="w-full bg-white border border-[#E2E8DC] rounded-xl p-3.5 text-sm resize-none h-24 focus:border-[#B5E342] focus:ring-2 focus:ring-[#B5E342]/20 outline-none transition-all text-[#192625] placeholder:text-gray-400 shadow-xs"
            placeholder="E.g., Deep pothole in the left lane near the signal. High risk for two-wheelers..."
            value={description}
            onChange={(e) => {
              setShowRejection(false);
              setDescription(e.target.value);
            }}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button 
            className={`w-full bg-[#192625] text-white rounded-xl py-4 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
              (!capturedImage || !category || isSubmitting) 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-[#2A3F3D]'
            }`}
            onClick={handleSubmit}
            disabled={!capturedImage || !category || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin text-[#D4F67B]" />
                <span>AI Inspecting & Validating Hazard...</span>
              </>
            ) : (
              <>
                <Send size={18} className="text-[#D4F67B]" />
                <span>Submit for AI Verification (+50 Pts)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Celebration Modal */}
      {showCelebration && (
        <CelebrationModal 
          isOpen={showCelebration} 
          onClose={resetForm} 
          points={50} 
        />
      )}

      <BottomNav />
      <DemoControls />
    </div>
  );
}
