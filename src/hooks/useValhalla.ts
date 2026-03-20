import type { LatLng, RouteResult } from '../types/route';
import { generateWaypoints, targetDistanceKm } from '../utils/waypointMath';
import { fetchTerrainWaypoints } from '../utils/terrainFetcher';

// Valhalla public instance (OpenStreetMap Germany)
// Uses pedestrian profile with exclude_roads for footway-only routing
const VALHALLA_API = 'https://valhalla1.openstreetmap.de/route';

// Decode Valhalla polyline (precision 6, not Google's precision 5)
function decodePolyline6(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  const factor = 1e6; // Valhalla uses precision 6

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;

    // Decode latitude
    let byte;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dLat;

    // Decode longitude
    result = 0;
    shift = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dLng;

    points.push({
      lat: lat / factor,
      lng: lng / factor,
    });
  }

  return points;
}

interface ValhallaResponse {
  trip: {
    summary: { length: number; time: number };
    legs: Array<{ shape: string }>;
    status: number;
  };
}

export function useValhalla() {
  async function generateRoute(origin: LatLng, desiredMinutes: number): Promise<RouteResult> {
    const targetKm = targetDistanceKm(desiredMinutes);
    let radiusKm = targetKm / (2 * Math.PI);

    let bestResult: RouteResult | null = null;
    let bestDiffRatio = Infinity;

    // Terrain-aware: fetch walkable paths once before retry loop (3 waypoints for out-and-back)
    let terrainWaypoints: LatLng[] | null = null;
    try {
      terrainWaypoints = await fetchTerrainWaypoints(origin, radiusKm, 3);
    } catch (err) {
      console.warn('Terrain fetch failed, using circular fallback:', err);
    }

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        // Hybrid approach: terrain-aware waypoints at half-distance
        // Terrain waypoints are filtered to 40-70% of radius, ensuring Valhalla
        // can find different outbound/return paths (no cul-de-sacs)
        let waypoints: LatLng[];
        if (terrainWaypoints) {
          waypoints = terrainWaypoints;
        } else {
          // Fallback: circular waypoints at ~half distance (3 waypoints for out-and-back, no backtracking)
          const halfRadiusKm = radiusKm / 2;
          waypoints = generateWaypoints(origin, halfRadiusKm, 3);
        }

        // Build Valhalla locations array: origin -> waypoints -> origin
        const allPoints = [origin, ...waypoints, origin];
        const locations = allPoints.map((p) => ({ lon: p.lng, lat: p.lat }));

        // Request body for Valhalla
        const requestBody = {
          locations,
          costing: 'pedestrian',
          costing_options: {
            pedestrian: {
              exclude_roads: true, // Only footways, paths, pedestrian areas
            },
          },
          directions_options: {
            units: 'km',
          },
        };

        const response = await fetch(VALHALLA_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`Valhalla API failed: ${response.statusText}`);
        }

        const data = (await response.json()) as ValhallaResponse;

        if (data.trip.status !== 0 || !data.trip.legs || data.trip.legs.length === 0) {
          throw new Error(`Valhalla returned status: ${data.trip.status}`);
        }

        // Decode the polyline shape from all legs
        const allCoordinates: LatLng[] = [];
        for (const leg of data.trip.legs) {
          const legPoints = decodePolyline6(leg.shape);
          // Skip the first point of all but the first leg to avoid duplicates at leg boundaries
          const startIdx = allCoordinates.length === 0 ? 0 : 1;
          allCoordinates.push(...legPoints.slice(startIdx));
        }

        const actualDistanceM = data.trip.summary.length * 1000; // km to meters
        const actualDurationS = data.trip.summary.time; // already in seconds
        const actualMinutes = actualDurationS / 60;

        const ratio = actualMinutes / desiredMinutes;
        const diffRatio = Math.abs(ratio - 1);

        if (diffRatio < bestDiffRatio) {
          bestResult = {
            coordinates: allCoordinates,
            waypoints,
            actualDistanceMeters: actualDistanceM,
            actualDurationSeconds: actualDurationS,
          };
          bestDiffRatio = diffRatio;
        }

        // If within 15% tolerance, return immediately
        if (diffRatio <= 0.15) {
          return bestResult!;
        }

        // Adjust radius for next attempt
        radiusKm = radiusKm * (desiredMinutes / actualMinutes);
      } catch (error) {
        console.error(`Route generation attempt ${attempt + 1} failed:`, error);
        // Continue to next attempt
      }
    }

    if (bestResult) {
      return bestResult;
    }

    throw new Error('Failed to generate route after 3 attempts');
  }

  return { generateRoute };
}
