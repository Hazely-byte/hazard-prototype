'use client';

import { X, AlertTriangle, CheckCheck, Clock, MapPin, ShieldAlert } from 'lucide-react';
import { useHazardStore, AreaAlert } from '@/store/hazardStore';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
}

export default function AlertsDrawer({ isOpen, onClose }: AlertsDrawerProps) {
  const alerts = useHazardStore((state) => state.alerts);
  const markAllAlertsRead = useHazardStore((state) => state.markAllAlertsRead);
  const dismissAlert = useHazardStore((state) => state.dismissAlert);

  if (!isOpen) return null;

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 animate-in fade-in duration-200" 
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8DC] bg-[#F8FAF5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="font-bold text-[#192625] text-base leading-tight">Active Area Alerts</h2>
              <p className="text-[11px] text-gray-500">Raipur Municipal Emergency Radar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-full transition-colors active:scale-95"
            aria-label="Close drawer"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-5 py-3 bg-white border-b border-[#E2E8DC] flex items-center justify-between">
          <div className="text-xs font-semibold text-gray-700">
            {alerts.length} Total Alerts {unreadCount > 0 && <span className="text-red-500 font-bold">({unreadCount} New)</span>}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAlertsRead}
              className="text-xs text-[#4D6C1D] font-medium hover:underline flex items-center gap-1 active:scale-95 transition-transform"
            >
              <CheckCheck size={14} />
              Mark all as read
            </button>
          )}
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <CheckCheck size={40} className="text-green-500 mb-2" />
              <p className="font-semibold text-gray-700 text-sm">All Clear in Your Area</p>
              <p className="text-xs mt-1">No emergency calamities or high-priority warnings reported right now.</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const isHigh = alert.severity === 'high';
              return (
                <div
                  key={alert.id}
                  className={`rounded-2xl p-4 border transition-all relative ${
                    alert.isRead
                      ? 'bg-white border-[#E2E8DC]'
                      : isHigh
                      ? 'bg-red-50/70 border-red-200 shadow-sm'
                      : 'bg-amber-50/70 border-amber-200 shadow-sm'
                  }`}
                >
                  {/* Status & Severity Pill */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          isHigh
                            ? 'bg-red-500 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {alert.severity} Priority
                      </span>
                      {alert.actionStatus && (
                        <span className="text-[10px] font-semibold bg-white border border-[#E2E8DC] text-gray-700 px-2 py-0.5 rounded-full">
                          {alert.actionStatus}
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-gray-400 hover:text-gray-600 p-0.5 rounded"
                      title="Dismiss alert"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-sm text-[#192625] mb-1">
                    {alert.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed mb-3">
                    {alert.description}
                  </p>

                  {/* Metadata Footer */}
                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-black/5">
                    <div className="flex items-center gap-1 truncate max-w-[190px]">
                      <MapPin size={12} className="text-[#6A9325] shrink-0" />
                      <span className="truncate">{alert.location}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Clock size={11} />
                      <span>{getRelativeTime(alert.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#E2E8DC] bg-[#F8FAF5] text-center">
          <p className="text-[11px] text-gray-500">
            Emergency helpline: <span className="font-semibold text-gray-700">112</span> • Municipal Control: <span className="font-semibold text-gray-700">0771-2227222</span>
          </p>
        </div>
      </div>
    </>
  );
}
