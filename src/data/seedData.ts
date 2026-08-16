export type HazardCategory = 'pothole' | 'broken-bridge' | 'hanging-wire' | 'streetlight' | 'fallen-tree' | 'waterlogging' | 'other';
export type Severity = 'low' | 'medium' | 'high';
export type HazardStatus = 'active' | 'resolved' | 'under-review';

export interface Hazard {
  id: string;
  category: HazardCategory;
  severity: Severity;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  imageUrl: string;
  upvotes: number;
  reporterName: string;
  reporterPoints: number;
  timestamp: string; // ISO date string, use dates within last 2 weeks from 2026-08-15
  status: HazardStatus;
}

export interface Badge {
  id: string;
  name: string;
  icon: string; // emoji
  description: string;
  requirement: string;
}

export interface TierInfo {
  tier: number;
  name: string;
  minPoints: number;
  icon: string; // emoji
}

export interface RouteOption {
  id: string;
  name: string;
  duration: string;
  distance: string;
  dangerScore: number;
  hazardCount: number;
  hazardBreakdown: string;
  coordinates: [number, number][];
  color: string;
}

export interface RouteConfig {
  origin: string;
  destination: string;
  routes: RouteOption[];
}

export const CATEGORY_LABELS: Record<HazardCategory, string> = {
  'pothole': 'Potholes',
  'broken-bridge': 'Bridges',
  'hanging-wire': 'Electrical',
  'streetlight': 'Broken Streetlight',
  'fallen-tree': 'Obstructions',
  'waterlogging': 'Waterlogging',
  'other': 'Other',
};

export const CATEGORY_ICONS: Record<HazardCategory, string> = {
  'pothole': '🕳️',
  'broken-bridge': '🌉',
  'hanging-wire': '⚡',
  'streetlight': '💡',
  'fallen-tree': '🌳',
  'waterlogging': '🌊',
  'other': '⚠️',
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  low: '#22C55E',
  medium: '#F59E0B',
  high: '#EF4444',
};

export const BADGES: Badge[] = [
  { id: 'first-responder', name: 'First Responder', icon: '🚨', description: 'Reported first hazard', requirement: '1 report' },
  { id: 'eagle-eye', name: 'Eagle Eye', icon: '🦅', description: 'Consistently accurate reporting', requirement: '10 verified reports' },
  { id: 'road-savior', name: 'Road Savior', icon: '🛣️', description: 'Reported critical road hazards', requirement: '5 high severity potholes/bridges' },
  { id: 'community-champion', name: 'Community Champion', icon: '🏆', description: 'Most upvoted community member', requirement: '100 upvotes received' },
  { id: 'night-watchman', name: 'Night Watchman', icon: '🦉', description: 'Reported streetlight outages', requirement: '5 streetlight reports' },
  { id: 'storm-tracker', name: 'Storm Tracker', icon: '⛈️', description: 'Reported major waterlogging events', requirement: '5 waterlogging reports' },
];

export const TIERS: TierInfo[] = [
  { tier: 1, name: 'Citizen', minPoints: 0, icon: '👤' },
  { tier: 2, name: 'Guardian', minPoints: 200, icon: '🛡️' },
  { tier: 3, name: 'Sentinel', minPoints: 500, icon: '👁️' },
  { tier: 4, name: 'Warden', minPoints: 1000, icon: '⚔️' },
  { tier: 5, name: 'Commissioner', minPoints: 2000, icon: '👑' },
];

export const SEED_HAZARDS: Hazard[] = [
  {
    id: 'h1',
    category: 'pothole',
    severity: 'high',
    title: 'Crater-sized Pothole on VIP Road',
    description: 'A huge pothole causing severe traffic slowdowns. Multiple two-wheelers have skidded here.',
    location: { lat: 21.245, lng: 81.635, address: 'VIP Road, Raipur' },
    imageUrl: 'https://placehold.co/400x300/1E2818/D4F67B?text=Pothole+VIP+Road',
    upvotes: 89,
    reporterName: 'Rahul V.',
    reporterPoints: 650,
    timestamp: '2026-08-14T08:30:00Z',
    status: 'active',
  },
  {
    id: 'h2',
    category: 'waterlogging',
    severity: 'high',
    title: 'Severe Waterlogging near Telibandha Lake',
    description: 'Knee-deep water on the main road after heavy rains. Avoid this route completely.',
    location: { lat: 21.248, lng: 81.640, address: 'Telibandha Lake Area, Raipur' },
    imageUrl: 'https://placehold.co/400x300/1E2818/D4F67B?text=Waterlogging+Telibandha',
    upvotes: 75,
    reporterName: 'Priya S.',
    reporterPoints: 890,
    timestamp: '2026-08-15T07:15:00Z',
    status: 'active',
  },
  {
    id: 'h3',
    category: 'hanging-wire',
    severity: 'high',
    title: 'Live Wire Hanging low',
    description: 'Electric wire hanging dangerously low near the pedestrian crossing.',
    location: { lat: 21.235, lng: 81.620, address: 'GE Road, Raipur' },
    imageUrl: 'https://placehold.co/400x300/1E2818/D4F67B?text=Hanging+Wire+GE+Road',
    upvotes: 56,
    reporterName: 'Amit D.',
    reporterPoints: 420,
    timestamp: '2026-08-13T14:45:00Z',
    status: 'under-review',
  },
  {
    id: 'h4',
    category: 'fallen-tree',
    severity: 'medium',
    title: 'Fallen branch blocking left lane',
    description: 'A large branch fell during last night\'s storm, blocking one lane.',
    location: { lat: 21.255, lng: 81.625, address: 'Shankar Nagar, Raipur' },
    imageUrl: 'https://placehold.co/400x300/1E2818/D4F67B?text=Fallen+Tree+Shankar+Nagar',
    upvotes: 42,
    reporterName: 'Neha K.',
    reporterPoints: 310,
    timestamp: '2026-08-12T09:10:00Z',
    status: 'active',
  },
  {
    id: 'h5',
    category: 'streetlight',
    severity: 'low',
    title: 'Streetlight not working for 3 days',
    description: 'Pitch dark at the turn, making it dangerous for pedestrians at night.',
    location: { lat: 21.240, lng: 81.640, address: 'Pandri Market, Raipur' },
    imageUrl: 'https://placehold.co/400x300/1E2818/D4F67B?text=Broken+Streetlight+Pandri',
    upvotes: 21,
    reporterName: 'Vikas R.',
    reporterPoints: 150,
    timestamp: '2026-08-11T18:20:00Z',
    status: 'active',
  },
  {
    id: 'h6',
    category: 'pothole',
    severity: 'medium',
    title: 'Multiple potholes near Marine Drive',
    description: 'Series of potholes formed near the food stalls.',
    location: { lat: 21.250, lng: 81.643, address: 'Marine Drive, Telibandha' },
    imageUrl: 'https://placehold.co/400x300/1E2818/D4F67B?text=Pothole+Marine+Drive',
    upvotes: 38,
    reporterName: 'Ananya P.',
    reporterPoints: 520,
    timestamp: '2026-08-14T19:30:00Z',
    status: 'active',
  },
  {
    id: 'h7',
    category: 'broken-bridge',
    severity: 'high',
    title: 'Cracks in small culvert',
    description: 'Visible cracks in the concrete on the side of the culvert.',
    location: { lat: 21.260, lng: 81.630, address: 'Civil Lines, Raipur' },
    imageUrl: 'https://placehold.co/400x300/1E2818/D4F67B?text=Broken+Bridge+Civil+Lines',
    upvotes: 62,
    reporterName: 'Sanjay M.',
    reporterPoints: 780,
    timestamp: '2026-08-10T11:00:00Z',
    status: 'active',
  },
  {
    id: 'h8',
    category: 'waterlogging',
    severity: 'medium',
    title: 'Moderate waterlogging under bridge',
    description: 'Slow traffic due to accumulated water.',
    location: { lat: 21.243, lng: 81.637, address: 'Fafadih, Raipur' },
    imageUrl: 'https://placehold.co/400x300/1E2818/D4F67B?text=Waterlogging+Fafadih',
    upvotes: 28,
    reporterName: 'Ravi T.',
    reporterPoints: 210,
    timestamp: '2026-08-15T08:45:00Z',
    status: 'active',
  },
  {
    id: 'h9',
    category: 'streetlight',
    severity: 'low',
    title: 'Flickering Streetlight',
    description: 'Streetlight is constantly flickering, causing distraction.',
    location: { lat: 21.270, lng: 81.605, address: 'Tatibandh, Raipur' },
    imageUrl: 'https://placehold.co/400x300/1E2818/D4F67B?text=Streetlight+Tatibandh',
    upvotes: 15,
    reporterName: 'Sneha L.',
    reporterPoints: 90,
    timestamp: '2026-08-09T20:15:00Z',
    status: 'active',
  },
  {
    id: 'h10',
    category: 'pothole',
    severity: 'low',
    title: 'Small pothole fixed',
    description: 'The small pothole was patched up by the municipality yesterday.',
    location: { lat: 21.235, lng: 81.635, address: 'Station Road, Raipur' },
    imageUrl: 'https://placehold.co/400x300/1E2818/D4F67B?text=Pothole+Station+Road',
    upvotes: 8,
    reporterName: 'Karan J.',
    reporterPoints: 340,
    timestamp: '2026-08-05T10:00:00Z',
    status: 'resolved',
  },
  {
    id: 'h11',
    category: 'hanging-wire',
    severity: 'medium',
    title: 'Cable wires hanging loosely',
    description: 'Internet or cable wires hanging onto the footpath.',
    location: { lat: 21.245, lng: 81.635, address: 'VIP Road, Raipur' },
    imageUrl: 'https://placehold.co/400x300/1E2818/D4F67B?text=Hanging+Wire+VIP+Road',
    upvotes: 19,
    reporterName: 'Pooja G.',
    reporterPoints: 260,
    timestamp: '2026-08-12T16:30:00Z',
    status: 'active',
  },
  {
    id: 'h12',
    category: 'fallen-tree',
    severity: 'medium',
    title: 'Tree cleared from road',
    description: 'The fallen tree blocking the road has been cleared completely.',
    location: { lat: 21.255, lng: 81.625, address: 'Shankar Nagar, Raipur' },
    imageUrl: 'https://placehold.co/400x300/1E2818/D4F67B?text=Fallen+Tree+Shankar+Nagar',
    upvotes: 45,
    reporterName: 'Gaurav B.',
    reporterPoints: 590,
    timestamp: '2026-08-06T12:00:00Z',
    status: 'resolved',
  },
  {
    id: 'h13',
    category: 'other',
    severity: 'low',
    title: 'Open Manhole Cover',
    description: 'Manhole cover is slightly displaced. Dangerous for pedestrians.',
    location: { lat: 21.248, lng: 81.640, address: 'Telibandha Lake Area, Raipur' },
    imageUrl: 'https://placehold.co/400x300/1E2818/D4F67B?text=Open+Manhole+Telibandha',
    upvotes: 33,
    reporterName: 'Megha N.',
    reporterPoints: 410,
    timestamp: '2026-08-14T09:20:00Z',
    status: 'active',
  },
  {
    id: 'h14',
    category: 'pothole',
    severity: 'low',
    title: 'Uneven road surface',
    description: 'Road surface is very uneven after recent pipe laying work.',
    location: { lat: 21.260, lng: 81.630, address: 'Civil Lines, Raipur' },
    imageUrl: 'https://placehold.co/400x300/1E2818/D4F67B?text=Uneven+Road+Civil+Lines',
    upvotes: 12,
    reporterName: 'Deepak C.',
    reporterPoints: 180,
    timestamp: '2026-08-11T14:10:00Z',
    status: 'active',
  },
  {
    id: 'h15',
    category: 'waterlogging',
    severity: 'medium',
    title: 'Drain overflowing',
    description: 'Side drain is blocked and overflowing onto the street.',
    location: { lat: 21.240, lng: 81.640, address: 'Pandri Market, Raipur' },
    imageUrl: 'https://placehold.co/400x300/1E2818/D4F67B?text=Overflowing+Drain+Pandri',
    upvotes: 27,
    reporterName: 'Nisha S.',
    reporterPoints: 290,
    timestamp: '2026-08-13T17:50:00Z',
    status: 'active',
  }
];

export const DEMO_ROUTE: RouteConfig = {
  origin: 'Shankar Nagar, Raipur',
  destination: 'NIT Raipur',
  routes: [
    {
      id: 'route-a',
      name: 'Route A (Fastest)',
      duration: '14 mins',
      distance: '5.2 km',
      dangerScore: 8.5,
      hazardCount: 4,
      hazardBreakdown: '2 High, 2 Medium',
      coordinates: [
        [21.255, 81.625],
        [21.252, 81.623],
        [21.245, 81.615],
        [21.240, 81.610],
        [21.238, 81.605],
        [21.240, 81.602],
        [21.245, 81.604],
        [21.248, 81.605]
      ],
      color: '#EF4444',
    },
    {
      id: 'route-b',
      name: 'Route B (Safest)',
      duration: '17 mins',
      distance: '6.8 km',
      dangerScore: 1.2,
      hazardCount: 1,
      hazardBreakdown: '1 Low',
      coordinates: [
        [21.255, 81.625],
        [21.258, 81.630],
        [21.260, 81.635],
        [21.265, 81.630],
        [21.265, 81.620],
        [21.262, 81.615],
        [21.255, 81.608],
        [21.250, 81.605],
        [21.248, 81.605]
      ],
      color: '#22C55E',
    }
  ]
};
