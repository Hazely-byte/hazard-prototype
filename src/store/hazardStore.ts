'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { Hazard, SEED_HAZARDS, BADGES, Badge, TierInfo, TIERS } from '@/data/seedData';
import { supabase } from '@/lib/supabaseClient';

export interface ActivityEntry {
  id: string;
  type: 'report' | 'upvote' | 'badge' | 'points';
  description: string;
  timestamp: string;
  points?: number;
}

export interface AreaAlert {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  location: string;
  timestamp: string;
  isRead: boolean;
  actionStatus?: string;
}

export interface UserProfile {
  name: string;
  civicPoints: number;
  reportsCount: number;
  upvotesReceived: number;
  hazardsResolved: number;
  earnedBadgeIds: string[];
  activityLog: ActivityEntry[];
}

export const INITIAL_ALERTS: AreaAlert[] = [
  {
    id: 'alert-1',
    title: 'High Priority: Live Wire Hanging',
    description: 'High-voltage power line dangling low across roadway near Shankar Nagar Sector 2. Emergency repair crew dispatched.',
    severity: 'high',
    location: 'Shankar Nagar Sector 2, Raipur',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    isRead: false,
    actionStatus: 'Crews En Route',
  },
  {
    id: 'alert-2',
    title: 'Severe Waterlogging: VIP Road Underpass',
    description: 'Underpass flooded with ~2.5 ft water depth. Traffic diverted toward Telibandha Lake arterial road.',
    severity: 'high',
    location: 'VIP Road Underpass, Raipur',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    isRead: false,
    actionStatus: 'Pumps Active',
  },
  {
    id: 'alert-3',
    title: 'Road Cave-In & Barricade',
    description: 'Deep trench formed near GE Road opposite City Center. Left lane closed for emergency resurfacing.',
    severity: 'medium',
    location: 'GE Road near City Center, Raipur',
    timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    isRead: false,
    actionStatus: 'Barricaded',
  },
];

interface HazardState {
  hazards: Hazard[];
  userProfile: UserProfile;
  userUpvotedHazardIds: string[];
  userLocation: { lat: number; lng: number };
  weatherAlertActive: boolean;
  weatherAlertMessage: string;
  alerts: AreaAlert[];
  simulateAI: boolean;
  activeFilter: string;
  _hasHydrated: boolean;
  
  // Actions
  setHasHydrated: (state: boolean) => void;
  setUserLocation: (location: { lat: number; lng: number }) => void;
  addHazard: (hazard: Omit<Hazard, 'id' | 'upvotes' | 'timestamp' | 'status' | 'reporterName' | 'reporterPoints'>) => void;
  toggleUpvote: (id: string) => void;
  upvoteHazard: (id: string) => void;
  setFilter: (filter: string) => void;
  fetchSeedData: () => Promise<void>;
  simulateRapidUpvotes: () => void;
  toggleWeatherAlert: () => void;
  toggleSimulateAI: () => void;
  markAllAlertsRead: () => void;
  dismissAlert: (id: string) => void;
  addCivicPoints: (points: number, reason: string) => void;
  reportPost: (reason: string) => void;
  deleteHazard: (id: string) => void;
  getCurrentTier: () => TierInfo;
  getEarnedBadges: () => Badge[];
  resetStore: () => void;
}

const initialProfile: UserProfile = {
  name: 'Owner',
  civicPoints: 730,
  reportsCount: 12,
  upvotesReceived: 48,
  hazardsResolved: 3,
  earnedBadgeIds: ['first-responder', 'eagle-eye', 'road-savior'],
  activityLog: [],
};

// Resilient Quota-Safe LocalStorage Wrapper
const safeLocalStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(name, value);
    } catch (e: any) {
      console.warn('LocalStorage setItem quota warning, applying automated pruning:', e);
      try {
        // Parse and prune stored state to fit quota
        const parsed = JSON.parse(value);
        if (parsed?.state?.hazards && Array.isArray(parsed.state.hazards)) {
          // Keep only the 10 most recent hazards and strip bulky base64 from older ones
          parsed.state.hazards = parsed.state.hazards.slice(0, 10).map((h: Hazard, idx: number) => {
            if (idx >= 3 && h.imageUrl && h.imageUrl.startsWith('data:')) {
              return { ...h, imageUrl: 'https://placehold.co/400x300/1E2818/D4F67B?text=Reported+Hazard' };
            }
            return h;
          });
          localStorage.setItem(name, JSON.stringify(parsed));
        }
      } catch (innerError) {
        console.error('Failed to prune and set localStorage:', innerError);
      }
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(name);
    } catch {
      // ignore
    }
  },
};

export const useHazardStore = create<HazardState>()(
  persist(
    (set, get) => ({
      hazards: [],
      userProfile: initialProfile,
      userUpvotedHazardIds: ['h1'],
      userLocation: { lat: 21.2514, lng: 81.6296 },
      weatherAlertActive: false,
      weatherAlertMessage: '',
      alerts: INITIAL_ALERTS,
      simulateAI: false,
      activeFilter: 'all',
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      setUserLocation: (location) => {
        set({ userLocation: location });
      },

      addHazard: async (hazardData) => {
        const id = crypto.randomUUID();
        const timestamp = new Date().toISOString();
        const userProfile = get().userProfile;
        
        const newHazard: Hazard = {
          ...hazardData,
          id,
          upvotes: 0,
          timestamp,
          status: 'active',
          reporterName: userProfile.name,
          reporterPoints: userProfile.civicPoints + 50,
          isDeletable: true,
        };

        const newActivity: ActivityEntry = {
          id: crypto.randomUUID(),
          type: 'report',
          description: `Reported a new hazard: ${hazardData.title}`,
          timestamp,
          points: 50,
        };

        // Retain max 20 hazards in memory to prevent unbounded memory growth
        set((state) => {
          const updatedHazards = [newHazard, ...state.hazards].slice(0, 20);
          return {
            hazards: updatedHazards,
            userProfile: {
              ...state.userProfile,
              civicPoints: state.userProfile.civicPoints + 50,
              reportsCount: state.userProfile.reportsCount + 1,
              activityLog: [newActivity, ...state.userProfile.activityLog].slice(0, 30),
            },
          };
        });

        // Supabase Insert (Optimistic UI)
        try {
          await supabase.from('hazards').insert({
            id,
            type: hazardData.category,
            title: hazardData.title,
            description: hazardData.description,
            location_lat: hazardData.location.lat,
            location_lng: hazardData.location.lng,
            location_address: hazardData.location.address || '',
            image_url: hazardData.imageUrl,
            severity: hazardData.severity,
            upvotes: 0,
            reporter_name: userProfile.name,
            reporter_points: userProfile.civicPoints + 50,
            status: 'active',
            is_deletable: true
          });
        } catch (error) {
          console.error("Failed to insert hazard into Supabase:", error);
        }
      },

      toggleUpvote: (id) => {
        set((state) => {
          const isCurrentlyUpvoted = state.userUpvotedHazardIds.includes(id);
          const hazard = state.hazards.find((h) => h.id === id);
          if (!hazard) return state;

          const timestamp = new Date().toISOString();

          if (isCurrentlyUpvoted) {
            const updatedUpvotedIds = state.userUpvotedHazardIds.filter((hId) => hId !== id);
            const updatedHazards = state.hazards.map((h) =>
              h.id === id ? { ...h, upvotes: Math.max(0, h.upvotes - 1) } : h
            );

            return {
              userUpvotedHazardIds: updatedUpvotedIds,
              hazards: updatedHazards,
              userProfile: {
                ...state.userProfile,
                civicPoints: Math.max(0, state.userProfile.civicPoints - 2),
              },
            };
          } else {
            const updatedUpvotedIds = [...state.userUpvotedHazardIds, id];
            const updatedHazards = state.hazards.map((h) =>
              h.id === id ? { ...h, upvotes: h.upvotes + 1 } : h
            );

            const newActivity: ActivityEntry = {
              id: crypto.randomUUID(),
              type: 'upvote',
              description: `Upvoted hazard: ${hazard.title}`,
              timestamp,
              points: 2,
            };

            return {
              userUpvotedHazardIds: updatedUpvotedIds,
              hazards: updatedHazards,
              userProfile: {
                ...state.userProfile,
                civicPoints: state.userProfile.civicPoints + 2,
                activityLog: [newActivity, ...state.userProfile.activityLog].slice(0, 30),
              },
            };
          }
        });
      },

      upvoteHazard: (id) => {
        get().toggleUpvote(id);
      },

      setFilter: (filter) => set({ activeFilter: filter }),

      fetchSeedData: async () => {
        try {
          const { data, error } = await supabase
            .from('hazards')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.error("Supabase fetch error:", error);
            return;
          }

          let mappedHazards: Hazard[] = [];
          if (data && data.length > 0) {
            mappedHazards = data.map((row: any) => ({
              id: row.id,
              category: row.type,
              title: row.title,
              description: row.description,
              location: {
                lat: row.location_lat,
                lng: row.location_lng,
                address: row.location_address || '',
              },
              imageUrl: row.image_url,
              severity: row.severity,
              upvotes: row.upvotes,
              reporterName: row.reporter_name,
              reporterPoints: row.reporter_points,
              timestamp: row.created_at,
              status: row.status,
              isDeletable: row.is_deletable,
            }));
          }

          let seedHazards: Hazard[] = [];
          try {
            const res = await fetch('/api/seed');
            const seedData = await res.json();
            if (seedData.hazards && seedData.hazards.length > 0) {
              seedHazards = seedData.hazards.map((h: Hazard) => ({ ...h, isDeletable: false }));
            }
          } catch (seedErr) {
            console.error("Failed to fetch local seed data:", seedErr);
          }

          const combinedHazards = [...mappedHazards, ...seedHazards];

          set({
            hazards: combinedHazards,
            userUpvotedHazardIds: [],
            alerts: INITIAL_ALERTS,
            userProfile: {
              ...get().userProfile,
              activityLog: [
                {
                  id: crypto.randomUUID(),
                  type: 'badge',
                  description: 'Loaded live and seed data',
                  timestamp: new Date().toISOString(),
                },
              ],
            },
          });
        } catch (error) {
          console.error("Failed to fetch seed data:", error);
        }
      },

      simulateRapidUpvotes: () => {
        set((state) => {
          if (state.hazards.length === 0) return state;
          
          const sortedHazards = [...state.hazards].sort((a, b) => b.upvotes - a.upvotes);
          const topHazard = sortedHazards[0];
          
          return {
            hazards: state.hazards.map((h) => 
              h.id === topHazard.id ? { ...h, upvotes: h.upvotes + 25 } : h
            ),
          };
        });
      },

      toggleWeatherAlert: () => {
        set((state) => ({
          weatherAlertActive: !state.weatherAlertActive,
          weatherAlertMessage: !state.weatherAlertActive 
            ? 'Heavy Rain & Waterlogging reported on VIP Road, Raipur. Tap to confirm condition.'
            : '',
        }));
      },

      toggleSimulateAI: () => set((state) => ({ simulateAI: !state.simulateAI })),

      markAllAlertsRead: () => {
        set((state) => ({
          alerts: state.alerts.map((a) => ({ ...a, isRead: true })),
        }));
      },

      dismissAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        }));
      },

      addCivicPoints: (points, reason) => {
        set((state) => {
          const timestamp = new Date().toISOString();
          const newActivity: ActivityEntry = {
            id: crypto.randomUUID(),
            type: 'points',
            description: reason,
            timestamp,
            points,
          };

          return {
            userProfile: {
              ...state.userProfile,
              civicPoints: state.userProfile.civicPoints + points,
              activityLog: [newActivity, ...state.userProfile.activityLog].slice(0, 30),
            },
          };
        });
      },

      reportPost: (reason) => {
        set((state) => {
          const timestamp = new Date().toISOString();
          const newActivity: ActivityEntry = {
            id: crypto.randomUUID(),
            type: 'report',
            description: `Reported post for review (${reason})`,
            timestamp,
            points: 0,
          };

          return {
            userProfile: {
              ...state.userProfile,
              activityLog: [newActivity, ...state.userProfile.activityLog].slice(0, 30),
            },
          };
        });
      },

      deleteHazard: (id) => {
        set((state) => ({
          hazards: state.hazards.filter((h) => h.id !== id),
        }));
      },

      getCurrentTier: () => {
        const points = get().userProfile.civicPoints;
        const eligibleTiers = TIERS.filter((tier) => tier.minPoints <= points);
        return eligibleTiers[eligibleTiers.length - 1] || TIERS[0];
      },

      getEarnedBadges: () => {
        const earnedIds = get().userProfile.earnedBadgeIds;
        return BADGES.filter((badge) => earnedIds.includes(badge.id));
      },

      resetStore: () => set({ 
        hazards: [], 
        userProfile: initialProfile,
        userUpvotedHazardIds: [],
        weatherAlertActive: false,
        weatherAlertMessage: '',
        alerts: INITIAL_ALERTS,
        simulateAI: false,
        activeFilter: 'all',
      }),
    }),
    {
      name: 'sanket-store',
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({ 
        hazards: state.hazards, 
        userProfile: state.userProfile,
        userUpvotedHazardIds: state.userUpvotedHazardIds,
        userLocation: state.userLocation,
        weatherAlertActive: state.weatherAlertActive,
        weatherAlertMessage: state.weatherAlertMessage,
        alerts: state.alerts,
        simulateAI: state.simulateAI,
        activeFilter: state.activeFilter,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
