import type { LatLng } from '../types/route';

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';
const OVERPASS_TIMEOUT_MS = 8000;
const EARTH_RADIUS_KM = 6371;

// Overpass API types
interface OverpassNode {
  type: 'node';
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

interface OverpassWayGeomPoint {
  lat: number;
  lon: number;
}

interface OverpassWay {
  type: 'way';
  id: number;
  tags?: Record<string, string>;
  geometry: OverpassWayGeomPoint[];
}

type OverpassElement = OverpassNode | OverpassWay;

interface OverpassResponse {
  elements: OverpassElement[];
}

// Internal scored candidate
interface TerrainCandidate {
  point: LatLng;
  bearing: number; // 0-360
  distanceKm: number;
  score: number; // higher is better
}

// Helper functions
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

function haversineDistance(from: LatLng, to: LatLng): number {
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function bearingTo(from: LatLng, to: LatLng): number {
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLng = toRad(to.lng - from.lng);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function scoreForType(tags?: Record<string, string>): number {
  if (!tags) return 10;

  const highway = tags['highway'];
  const leisure = tags['leisure'];
  const landuse = tags['landuse'];

  if (leisure === 'park' || landuse === 'grass') return 100;
  if (highway === 'footway') return 80;
  if (highway === 'path' || highway === 'pedestrian') return 70;
  if (highway === 'living_street') return 50;
  if (highway === 'cycleway') return 40;
  if (highway === 'residential') return 30;

  return 10;
}

function buildOverpassQuery(origin: LatLng, searchRadiusM: number): string {
  return `[out:json][timeout:8];
(
  way["highway"="footway"](around:${searchRadiusM},${origin.lat},${origin.lng});
  way["highway"="path"](around:${searchRadiusM},${origin.lat},${origin.lng});
  way["highway"="pedestrian"](around:${searchRadiusM},${origin.lat},${origin.lng});
  way["highway"="residential"](around:${searchRadiusM},${origin.lat},${origin.lng});
  way["highway"="living_street"](around:${searchRadiusM},${origin.lat},${origin.lng});
  way["highway"="cycleway"]["foot"!="no"](around:${searchRadiusM},${origin.lat},${origin.lng});
  way["leisure"="park"](around:${searchRadiusM},${origin.lat},${origin.lng});
  way["landuse"="grass"](around:${searchRadiusM},${origin.lat},${origin.lng});
  node["leisure"="park"](around:${searchRadiusM},${origin.lat},${origin.lng});
  node["amenity"="park"](around:${searchRadiusM},${origin.lat},${origin.lng});
);
out geom;`;
}

async function fetchOverpassData(query: string): Promise<OverpassResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS);

  try {
    const response = await fetch(OVERPASS_API, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

function extractCandidates(
  data: OverpassResponse,
  origin: LatLng,
  minDistKm: number,
  maxDistKm: number
): TerrainCandidate[] {
  const candidates: TerrainCandidate[] = [];

  for (const element of data.elements) {
    if (element.type === 'node') {
      const point: LatLng = { lat: element.lat, lng: element.lon };
      const dist = haversineDistance(origin, point);

      if (dist >= minDistKm && dist <= maxDistKm) {
        candidates.push({
          point,
          bearing: bearingTo(origin, point),
          distanceKm: dist,
          score: scoreForType(element.tags),
        });
      }
    } else if (element.type === 'way' && element.geometry && element.geometry.length > 0) {
      // Sub-sample long ways to avoid processing thousands of points
      const step = element.geometry.length > 10 ? 3 : 1;

      for (let i = 0; i < element.geometry.length; i += step) {
        const geomPoint = element.geometry[i];
        const point: LatLng = { lat: geomPoint.lat, lng: geomPoint.lon };
        const dist = haversineDistance(origin, point);

        if (dist >= minDistKm && dist <= maxDistKm) {
          candidates.push({
            point,
            bearing: bearingTo(origin, point),
            distanceKm: dist,
            score: scoreForType(element.tags),
          });
        }
      }
    }
  }

  return candidates;
}

function selectDistributedWaypoints(
  candidates: TerrainCandidate[],
  radiusKm: number,
  count: number = 6
): LatLng[] {
  const sectorCount = count;
  const sectorSize = 360 / sectorCount;
  const sectors: Map<number, TerrainCandidate[]> = new Map();

  // Distribute candidates into sectors
  for (const candidate of candidates) {
    const sectorIndex = Math.floor(candidate.bearing / sectorSize);
    if (!sectors.has(sectorIndex)) {
      sectors.set(sectorIndex, []);
    }
    sectors.get(sectorIndex)!.push(candidate);
  }

  // Select best candidate per sector
  const waypoints: Array<LatLng | null> = new Array(sectorCount).fill(null);
  let populatedSectors = 0;

  for (let i = 0; i < sectorCount; i++) {
    const sectorCandidates = sectors.get(i);
    if (!sectorCandidates || sectorCandidates.length === 0) continue;

    // Sort by: score descending, then distance closest to radiusKm
    sectorCandidates.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const distDiffA = Math.abs(a.distanceKm - radiusKm);
      const distDiffB = Math.abs(b.distanceKm - radiusKm);
      return distDiffA - distDiffB;
    });

    waypoints[i] = sectorCandidates[0].point;
    populatedSectors++;
  }

  // Require at least 3 sectors populated
  if (populatedSectors < 3) {
    throw new Error(
      `Insufficient terrain data: only ${populatedSectors} sectors populated out of ${sectorCount}`
    );
  }

  // For empty sectors, fall back to circular generation (handled by caller)
  // But here we return what we have, in bearing order
  return waypoints.filter((wp): wp is LatLng => wp !== null);
}

export async function fetchTerrainWaypoints(
  origin: LatLng,
  radiusKm: number,
  count: number = 6
): Promise<LatLng[]> {
  const searchRadiusM = radiusKm * 1.5 * 1000;
  const minDistKm = Math.max(0.3 * radiusKm, 0.1); // Avoid clustering at origin
  const maxDistKm = Math.min(1.5 * radiusKm, 100); // Upper bound to avoid distant outliers

  const query = buildOverpassQuery(origin, searchRadiusM);
  const data = await fetchOverpassData(query);

  const candidates = extractCandidates(data, origin, minDistKm, maxDistKm);

  if (candidates.length === 0) {
    throw new Error('No walkable terrain found in area');
  }

  const waypoints = selectDistributedWaypoints(candidates, radiusKm, count);

  // Sort by bearing to get clockwise order
  waypoints.sort((a, b) => bearingTo(origin, a) - bearingTo(origin, b));

  return waypoints;
}
