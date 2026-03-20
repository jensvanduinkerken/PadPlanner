import type { LatLng, RouteResult } from '../types/route';
import { generateWaypoints, targetDistanceKm } from '../utils/waypointMath';
import { fetchTerrainWaypoints } from '../utils/terrainFetcher';

// Use wheelchair routing mode - it prioritizes pedestrian paths and avoids highways
// Much better for walking routes than foot mode
const OSRM_API = 'https://router.project-osrm.org/route/v1/wheelchair';

export function useOSRM() {
  async function generateRoute(origin: LatLng, desiredMinutes: number): Promise<RouteResult> {
    const targetKm = targetDistanceKm(desiredMinutes);
    let radiusKm = targetKm / (2 * Math.PI);

    let bestResult: RouteResult | null = null;
    let bestDiffRatio = Infinity;

    // Terrain-aware: fetch walkable paths once before retry loop
    let terrainWaypoints: LatLng[] | null = null;
    try {
      terrainWaypoints = await fetchTerrainWaypoints(origin, radiusKm);
    } catch (err) {
      console.warn('Terrain fetch failed, using circular fallback:', err);
    }

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        // Hybrid approach: terrain-aware waypoints at half-distance
        // Terrain waypoints are filtered to 40-70% of radius, ensuring OSRM
        // can find different outbound/return paths (no cul-de-sacs)
        let waypoints: LatLng[];
        if (terrainWaypoints) {
          waypoints = terrainWaypoints;
        } else {
          // Fallback: circular waypoints at ~half distance
          const halfRadiusKm = radiusKm / 2;
          waypoints = generateWaypoints(origin, halfRadiusKm, 6);
        }

        const allPoints = [origin, ...waypoints, origin];

        // Format for OSRM: lng,lat (note the order!)
        const coordinatesString = allPoints.map((p) => `${p.lng},${p.lat}`).join(';');

        const response = await fetch(
          `${OSRM_API}/${coordinatesString}?overview=full&geometries=geojson`
        );

        if (!response.ok) {
          throw new Error(`OSRM API failed: ${response.statusText}`);
        }

        const data = (await response.json()) as {
          routes?: Array<{
            distance: number;
            duration: number;
            geometry: {
              coordinates: Array<[number, number]>;
            };
          }>;
          code: string;
        };

        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
          throw new Error(`OSRM returned: ${data.code}`);
        }

        const route = data.routes[0];
        const actualDistanceM = route.distance;
        const actualDurationS = route.duration;
        const actualMinutes = actualDurationS / 60;

        const ratio = actualMinutes / desiredMinutes;
        const diffRatio = Math.abs(ratio - 1);

        // Convert GeoJSON coordinates back to LatLng (lng,lat -> lat,lng)
        const routeCoordinates: LatLng[] = route.geometry.coordinates.map(([lng, lat]) => ({
          lat,
          lng,
        }));

        if (diffRatio < bestDiffRatio) {
          bestResult = {
            coordinates: routeCoordinates,
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
