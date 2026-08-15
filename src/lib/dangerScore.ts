import { Hazard } from '@/data/seedData';

interface DangerAnalysis {
  score: number; // 0-10 scale
  hazardCount: number;
  breakdown: string;
  level: 'safe' | 'moderate' | 'dangerous';
}

const SEVERITY_WEIGHTS = {
  low: 0.5,
  medium: 1.5,
  high: 3.0,
};

const PROXIMITY_RADIUS_KM = 0.3; // 300 meters from route

export function calculateRouteDangerScore(
  routeCoordinates: [number, number][],
  hazards: Hazard[]
): DangerAnalysis {
  const activeHazards = hazards.filter(h => h.status === 'active');
  let totalWeight = 0;
  let nearbyCount = 0;
  const categoryCounts: Record<string, number> = {};

  for (const hazard of activeHazards) {
    const minDist = getMinDistanceToRoute(
      hazard.location.lat,
      hazard.location.lng,
      routeCoordinates
    );

    if (minDist <= PROXIMITY_RADIUS_KM) {
      nearbyCount++;
      totalWeight += SEVERITY_WEIGHTS[hazard.severity];
      const cat = hazard.category;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
  }

  // Normalize to 0-10 scale
  const rawScore = totalWeight;
  const score = Math.min(10, Math.round(rawScore * 10) / 10);

  // Build breakdown string
  const parts = Object.entries(categoryCounts)
    .map(([cat, count]) => `${count} ${cat.replace('-', ' ')}`)
    .join(', ');
  const breakdown = parts || 'Clear of hazards';

  const level: DangerAnalysis['level'] =
    score <= 3 ? 'safe' : score <= 6 ? 'moderate' : 'dangerous';

  return { score, hazardCount: nearbyCount, breakdown, level };
}

function getMinDistanceToRoute(
  lat: number,
  lng: number,
  route: [number, number][]
): number {
  let minDist = Infinity;
  for (const [rLat, rLng] of route) {
    const dist = haversine(lat, lng, rLat, rLng);
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
