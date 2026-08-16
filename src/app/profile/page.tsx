'use client';

import { useState, useEffect } from 'react';
import { User, Award, TrendingUp, FileCheck, ThumbsUp, ShieldCheck, Clock, Star, ChevronRight } from 'lucide-react';
import { useHazardStore } from '@/store/hazardStore';
import BottomNav from '@/components/BottomNav';
import DemoControls from '@/components/DemoControls';
import { BADGES, TIERS } from '@/data/seedData';

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const userProfile = useHazardStore((state) => state.userProfile);
  const getCurrentTier = useHazardStore((state) => state.getCurrentTier);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const tier = getCurrentTier();
  const nextTier = TIERS.find(t => t.minPoints > userProfile.civicPoints);
  const pointsToNext = nextTier ? nextTier.minPoints - userProfile.civicPoints : 0;
  const progressPercent = nextTier ? ((userProfile.civicPoints - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100 : 100;

  // Fake activity if empty
  const activities = userProfile.activityLog.length > 0 ? userProfile.activityLog : [
    { id: '1', type: 'report', description: 'Reported Pothole at Main St', timestamp: new Date(Date.now() - 3600000).toISOString(), points: 10 },
    { id: '2', type: 'upvote', description: 'Upvoted Broken Streetlight', timestamp: new Date(Date.now() - 86400000).toISOString(), points: 2 },
    { id: '3', type: 'badge', description: 'Earned First Reporter badge', timestamp: new Date(Date.now() - 172800000).toISOString(), points: 50 }
  ];

  const getDotColor = (type: string) => {
    switch(type) {
      case 'report': return 'bg-[#B5E342]';
      case 'upvote': return 'bg-blue-400';
      case 'badge': return 'bg-amber-400';
      default: return 'bg-green-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF5] pb-24">
      {/* Profile Header */}
      <div className="bg-[#192625] text-white rounded-b-3xl px-6 pt-12 pb-14">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#D4F67B] flex items-center justify-center shrink-0">
            <User className="w-8 h-8 text-[#192625]" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{userProfile.name}</h1>
            <div className="flex items-center gap-1.5 mt-1 bg-[#D4F67B]/20 text-[#D4F67B] rounded-full px-3 py-1 w-max">
              <span className="text-sm font-medium">{tier.icon} {tier.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Civic Score Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mx-4 -mt-8 relative z-10 border border-[#E2E8DC]">
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="text-gray-500 text-sm font-medium mb-1">Civic Pts</div>
            <div className="text-4xl font-extrabold text-[#192625]">{userProfile.civicPoints}</div>
          </div>
          <Award className="w-10 h-10 text-[#B5E342] opacity-80" />
        </div>
        
        {nextTier && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Current Tier Progress</span>
              <span>{pointsToNext} pts to {nextTier.name}</span>
            </div>
            <div className="bg-gray-100 h-2 rounded-full w-full overflow-hidden">
              <div 
                className="bg-[#B5E342] h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 px-4 mt-6">
        <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-[#E2E8DC] flex flex-col items-center">
          <FileCheck className="w-5 h-5 text-[#6A9325] mb-2" />
          <div className="text-2xl font-bold text-[#192625]">{userProfile.reportsCount}</div>
          <div className="text-xs text-gray-500 mt-1">Reports Filed</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-[#E2E8DC] flex flex-col items-center">
          <ThumbsUp className="w-5 h-5 text-blue-500 mb-2" />
          <div className="text-2xl font-bold text-[#192625]">{userProfile.upvotesReceived}</div>
          <div className="text-xs text-gray-500 mt-1">Upvotes</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-[#E2E8DC] flex flex-col items-center">
          <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
          <div className="text-2xl font-bold text-[#192625]">{userProfile.hazardsResolved}</div>
          <div className="text-xs text-gray-500 mt-1">Hazards Fixed</div>
        </div>
      </div>

      {/* Badge Showcase */}
      <div className="mt-8">
        <div className="flex items-center gap-2 px-4 mb-3">
          <Star className="w-5 h-5 text-[#F59E0B]" />
          <h2 className="font-semibold text-sm text-[#192625]">Badges Earned</h2>
        </div>
        <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar pb-2">
          {BADGES.map(badge => {
            const isEarned = userProfile.earnedBadgeIds.includes(badge.id);
            return (
              <div 
                key={badge.id}
                className={`bg-white rounded-2xl p-4 min-w-[120px] text-center shadow-sm border border-[#E2E8DC] flex flex-col items-center shrink-0 ${!isEarned ? 'opacity-40 grayscale' : ''}`}
              >
                <div className="text-3xl mb-2 relative">
                  {badge.icon}
                  {!isEarned && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-full">
                      <div className="w-3 h-3 bg-gray-400 rounded-full" />
                    </div>
                  )}
                </div>
                <div className="text-xs font-semibold text-[#192625]">{badge.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="mt-8 px-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-500" />
          <h2 className="font-semibold text-sm text-[#192625]">Recent Activity</h2>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8DC] p-5">
          {activities.length > 0 ? (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {activities.map((activity, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-slate-300 ${getDotColor(activity.type)}`}></div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-3 md:ml-0 p-3 rounded-lg border border-slate-100 bg-slate-50">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-slate-900 text-sm">{activity.description}</div>
                      {typeof activity.points === 'number' && (
                        <div className={`text-xs font-bold px-1.5 rounded ${activity.points === 0 ? 'text-gray-500 bg-gray-100' : 'text-green-600 bg-green-100'}`}>
                          +{activity.points}
                        </div>
                      )}
                    </div>
                    <time className="text-xs text-slate-500">{new Date(activity.timestamp).toLocaleDateString()} {new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</time>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-gray-500 py-4">No activity yet</div>
          )}
        </div>
      </div>

      <BottomNav />
      <DemoControls />
    </div>
  );
}
