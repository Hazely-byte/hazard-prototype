import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { HazardCategory, Severity, HazardStatus } from '@/data/seedData';

// Helper to generate a random coordinate within ~8km of Raipur center
function generateRandomLocation() {
  const centerLat = 21.2514;
  const centerLng = 81.6296;
  const radiusInDegrees = 8 / 111; // ~8km

  const u = Math.random();
  const v = Math.random();
  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);

  // Adjust for longitude scaling
  const newLng = x / Math.cos(centerLat * Math.PI / 180);

  return {
    lat: centerLat + y,
    lng: centerLng + newLng,
    address: `${(Math.random() * 8).toFixed(1)} km away in Raipur`,
  };
}

// Category mapping from folder name to UI category
const categoryMap: Record<string, HazardCategory> = {
  'potholes': 'pothole',
  'Damaged Bridges': 'broken-bridge',
  'Live Wire': 'hanging-wire',
  'Fallen tree': 'fallen-tree',
  'drainage problem': 'waterlogging',
  'Man Hole': 'other'
};

function generateTitle(category: HazardCategory, severity: Severity): string {
  const adjectives = {
    high: ['Severe', 'Dangerous', 'Massive', 'Major', 'Critical'],
    medium: ['Large', 'Significant', 'Noticeable', 'Problematic'],
    low: ['Small', 'Minor', 'Slight', 'Mild']
  };
  
  const nouns: Record<string, string[]> = {
    'pothole': ['Pothole', 'Road Crater', 'Surface Damage'],
    'broken-bridge': ['Bridge Damage', 'Structural Crack', 'Bridge Wear'],
    'hanging-wire': ['Hanging Wire', 'Exposed Cable', 'Electrical Hazard'],
    'fallen-tree': ['Fallen Tree', 'Tree Branch', 'Obstruction'],
    'waterlogging': ['Waterlogging', 'Flooded Street', 'Drainage Blockage'],
    'other': ['Manhole Issue', 'Road Hazard', 'Safety Issue'],
    'streetlight': ['Streetlight Outage']
  };

  const locations = ['Main Street', 'Ring Road', 'VIP Road', 'GE Road', 'MG Road', 'Station Road', 'Local Lane', 'Highway', 'Intersection'];

  const adj = adjectives[severity][Math.floor(Math.random() * adjectives[severity].length)];
  const noun = nouns[category]?.[Math.floor(Math.random() * nouns[category].length)] || nouns['other'][0];
  const loc = locations[Math.floor(Math.random() * locations.length)];

  if (Math.random() > 0.3) {
    return `${adj} ${noun} on ${loc}`;
  }
  return `${adj} ${noun}`;
}

// Descriptions mapping
const categoryDescriptions: Record<HazardCategory, string[]> = {
  'pothole': [
    'Deep pothole causing significant damage to passing vehicles.',
    'Series of potholes making this road extremely dangerous for two-wheelers.',
    'Large crater formed after recent heavy rains.',
    'Surface deterioration leading to a hazardous pothole.',
  ],
  'broken-bridge': [
    'Structural damage visible on the bridge support.',
    'Cracks appearing on the bridge surface, needs immediate inspection.',
    'Bridge safety wall broken, posing a fall risk.',
    'Significant damage to the bridge infrastructure.',
  ],
  'hanging-wire': [
    'Live electrical wire hanging dangerously low over the pedestrian path.',
    'Tangled wires posing a serious fire and electrocution hazard.',
    'Broken power line resting on a nearby fence.',
    'Poorly managed cables hanging onto the main road.',
  ],
  'fallen-tree': [
    'Massive tree fallen across the road, completely blocking traffic.',
    'Large branch broken off during a storm, obstructing the sidewalk.',
    'Fallen tree damaging nearby infrastructure and blocking the lane.',
    'Uprooted tree creating a major hazard for commuters.',
  ],
  'waterlogging': [
    'Severe waterlogging due to blocked drainage, making the road impassable.',
    'Stagnant water accumulating after rain, posing a health and safety risk.',
    'Flooded street causing massive traffic bottlenecks.',
    'Drainage system failure resulting in deep waterlogging.',
  ],
  'other': [
    'Open manhole cover, extreme danger for pedestrians and cyclists.',
    'Unidentified hazard requiring urgent attention.',
    'Safety risk spotted on the roadway.',
  ],
  'streetlight': [
    'Streetlight is broken, leaving the area in complete darkness.',
  ]
};

export async function GET() {
  try {
    const hazardsDir = path.join(process.cwd(), 'public', 'hazards');
    const folders = fs.readdirSync(hazardsDir).filter(f => fs.statSync(path.join(hazardsDir, f)).isDirectory());
    
    const generatedHazards = [];

    for (const folder of folders) {
      const category = categoryMap[folder] || 'other';
      const folderPath = path.join(hazardsDir, folder);
      const files = fs.readdirSync(folderPath).filter(f => !f.startsWith('.'));

      for (const file of files) {
        const lowerName = file.toLowerCase();
        
        // Smart Severity
        let severity: Severity = 'medium';
        if (lowerName.match(/giant|multiple|severe|huge|massive|high|danger|live/)) {
          severity = 'high';
        } else if (lowerName.match(/small|low/)) {
          severity = 'low';
        }

        // Generate description
        const descriptions = categoryDescriptions[category] || categoryDescriptions['other'];
        const description = descriptions[Math.floor(Math.random() * descriptions.length)];

        // Generate fake title
        const title = generateTitle(category, severity);

        const hazard = {
          id: crypto.randomUUID(),
          category,
          severity,
          title: title.charAt(0).toUpperCase() + title.slice(1),
          description,
          location: generateRandomLocation(),
          imageUrl: `/hazards/${folder}/${encodeURIComponent(file)}`,
          upvotes: Math.floor(Math.random() * 100),
          reporterName: 'Civic Camera',
          reporterPoints: Math.floor(Math.random() * 500) + 100,
          timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7).toISOString(),
          status: 'active' as HazardStatus,
        };

        generatedHazards.push(hazard);
      }
    }

    // Sort by timestamp descending
    generatedHazards.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ hazards: generatedHazards });
  } catch (error: any) {
    console.error("Failed to generate seed data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
