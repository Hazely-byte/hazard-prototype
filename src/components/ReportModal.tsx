'use client';

import { useState } from 'react';
import { X, MapPin, AlertTriangle, ArrowBigUp, Flag, CheckCircle2, Clock, Trash } from 'lucide-react';
import { Hazard, CATEGORY_LABELS, CATEGORY_ICONS } from '@/data/seedData';
import { calculateDistance, formatDistance } from '@/lib/geocode';
import { useHazardStore } from '@/store/hazardStore';
import { supabase } from '@/lib/supabaseClient';

interface ReportModalProps {
  hazard: Hazard | null;
  isOpen: boolean;
  onClose: () => void;
  userLocation: { lat: number; lng: number } | null;
  isUpvoted: boolean;
  onUpvote: () => void;
  onReportSubmit: (reason: string) => void;
}

export default function ReportModal({ hazard, isOpen, onClose, userLocation, isUpvoted, onUpvote, onReportSubmit }: ReportModalProps) {
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [reportReason, setReportReason] = useState('Fake');
  const [otherReason, setOtherReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteHazard = useHazardStore((state) => state.deleteHazard);

  const handleDelete = async () => {
    if (!hazard) return;
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        await supabase.from('hazards').delete().eq('id', hazard.id);
        deleteHazard(hazard.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete hazard:', error);
        alert('Failed to delete report. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (!isOpen || !hazard) return null;

  const distanceKm = userLocation && hazard.location
    ? calculateDistance(userLocation.lat, userLocation.lng, hazard.location.lat, hazard.location.lng)
    : null;
  const formattedDistance = distanceKm ? formatDistance(distanceKm) : 'Unknown distance';

  const severityConfig = {
    low: { bg: 'bg-green-500', text: 'text-green-700', label: 'Low' },
    medium: { bg: 'bg-amber-500', text: 'text-amber-700', label: 'Medium' },
    high: { bg: 'bg-red-500', text: 'text-red-700', label: 'High' },
  };

  const sev = severityConfig[hazard.severity];
  const categoryLabel = CATEGORY_LABELS[hazard.category] || hazard.category;
  const categoryIcon = CATEGORY_ICONS[hazard.category] || '📋';

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center sm:items-center sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Image area */}
        <div className="relative h-64 shrink-0 bg-gray-900">
          <img 
            src={hazard.imageUrl} 
            alt={hazard.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all"
          >
            <X size={20} />
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30 flex items-center gap-1">
                <span>{categoryIcon}</span> {categoryLabel}
              </span>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${sev.bg} text-white shadow-sm`}>
                {sev.label} Priority
              </span>
            </div>
            <h2 className="text-xl font-bold text-white leading-tight drop-shadow-md">
              {hazard.title}
            </h2>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 pb-24 sm:pb-5">
          <div className="flex items-center text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <MapPin size={16} className="text-[#6A9325] mr-2 shrink-0" />
            <span className="truncate">{hazard.location.address}</span>
            <span className="ml-auto text-xs font-medium text-[#4D6C1D] bg-[#D4F67B]/30 px-2 py-1 rounded-md shrink-0">
              {formattedDistance}
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 text-sm leading-relaxed bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
              {hazard.description}
            </p>
          </div>

          {/* Progress Tracker */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Status Timeline</h3>
            <div className="relative border-l-2 border-[#D4F67B] ml-3 space-y-6">
              
              {/* Common initial state */}
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#6A9325] border-2 border-white shadow-sm flex items-center justify-center">
                  <CheckCircle2 size={10} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">Ticket Created</span>
                  <span className="text-xs text-gray-500">{new Date(hazard.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {hazard.imageUrl?.startsWith('data:') ? (
                // Dynamic states for user reports
                (() => {
                  const minutesElapsed = (Date.now() - new Date(hazard.timestamp).getTime()) / 60000;
                  const isWaitingForReview = minutesElapsed >= 5 && minutesElapsed < 10;
                  const isUnderReview = minutesElapsed >= 10;
                  const isLessThan5Mins = minutesElapsed < 5;

                  return (
                    <>
                      <div className={`relative pl-6 ${isLessThan5Mins ? 'opacity-40' : ''}`}>
                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
                          isUnderReview ? 'bg-[#6A9325]' : isWaitingForReview ? 'bg-[#B5E342]' : 'bg-gray-200'
                        }`}>
                          {isUnderReview && <CheckCircle2 size={10} className="text-white" />}
                          {isWaitingForReview && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-semibold ${isWaitingForReview || isUnderReview ? 'text-gray-900' : 'text-gray-500'}`}>Waiting for Review</span>
                          <span className="text-xs text-gray-500">
                            {isUnderReview ? 'Review started.' : 'Queued for human moderation.'}
                          </span>
                        </div>
                      </div>

                      <div className={`relative pl-6 ${!isUnderReview ? 'opacity-40' : ''}`}>
                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
                          isUnderReview ? 'bg-[#B5E342]' : 'bg-gray-200'
                        }`}>
                          {isUnderReview && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-semibold ${isUnderReview ? 'text-[#4D6C1D]' : 'text-gray-900'}`}>Under Review</span>
                          <span className="text-xs text-gray-500">Moderation team is assessing priority.</span>
                        </div>
                      </div>
                    </>
                  );
                })()
              ) : (
                // Static dummy states for seed reports
                <>
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#B5E342] border-2 border-white shadow-sm flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[#4D6C1D]">Engineer Assigned</span>
                      <span className="text-xs text-gray-500">Evaluating repair requirements...</span>
                    </div>
                  </div>

                  <div className="relative pl-6 opacity-40">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-200 border-2 border-white shadow-sm" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">Resolution Pending</span>
                      <span className="text-xs text-gray-500">Awaiting works completion</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onUpvote}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all active:scale-95 ${
                isUpvoted 
                  ? 'bg-[#192625] text-[#D4F67B] shadow-md' 
                  : 'bg-[#F8FAF5] text-[#192625] border border-[#E2E8DC] hover:bg-[#D4F67B]/20'
              }`}
            >
              <ArrowBigUp size={20} className={isUpvoted ? 'fill-current' : ''} />
              {isUpvoted ? 'Upvoted' : 'Upvote Priority'}
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowReportMenu(!showReportMenu)}
                className="flex items-center justify-center px-4 py-3 h-full rounded-xl bg-red-50 text-red-600 font-semibold border border-red-100 hover:bg-red-100 transition-all active:scale-95"
              >
                <Flag size={18} />
              </button>

              {showReportMenu && (
                <div className="absolute bottom-full right-0 mb-3 w-64 bg-white border border-gray-200 shadow-xl rounded-2xl p-4 z-50 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-gray-900">Report Issue</h4>
                    <button onClick={() => setShowReportMenu(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                  </div>
                  <div className="space-y-2 mb-4">
                    {['Fake', 'Misleading', 'Spam', 'Other'].map((reason) => (
                      <label key={reason} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input 
                          type="radio" 
                          name="reportReason" 
                          value={reason} 
                          checked={reportReason === reason} 
                          onChange={(e) => setReportReason(e.target.value)}
                          className="accent-red-500"
                        />
                        {reason}
                      </label>
                    ))}
                  </div>
                  {reportReason === 'Other' && (
                    <input 
                      type="text" 
                      placeholder="Please specify..." 
                      value={otherReason}
                      onChange={(e) => setOtherReason(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 mb-4 outline-none focus:border-red-300"
                    />
                  )}
                  <button 
                    onClick={() => {
                      setShowReportMenu(false);
                      onReportSubmit(reportReason === 'Other' ? otherReason : reportReason);
                    }}
                    className="w-full bg-red-500 text-white font-bold text-sm py-2 rounded-lg hover:bg-red-600 active:scale-95 transition-all shadow-sm"
                  >
                    Submit Report
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Delete Action (Conditional) */}
          {hazard.isDeletable && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50"
              >
                <Trash size={18} />
                {isDeleting ? 'Deleting...' : 'Delete Report'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
