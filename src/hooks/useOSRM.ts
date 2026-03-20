import type { LatLng, RouteResult } from '../types/route';
import { destinationPoint, targetDistanceKm } from '../utils/waypointMath';

// Use wheelchair routing mode - it prioritizes pedestrian paths and avoids highways
// Much better for walking routes than foot mode
const OSRM_API = 'https://router.project-osrm.org/route/v1/wheelchair';

export function useOSRM() {
  async function generateRoute(origin: LatLng, desiredMinutes: number): Promise<RouteResult> {
    const targetKm = targetDistanceKm(desiredMinutes);
    let radiusKm = targetKm / (2 * Math.PI);

    let bestResult: RouteResult | null = null;
    let bestDiffRatio = Infinity;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        // Out & Back Split: generate 1-2 waypoints at half distance
        // This creates an out-and-back route where OSRM finds different paths
        const halfRadiusKm = radiusKm / 2;
        const waypoints: LatLng[] = [];

        // Add waypoint at ~90° (to the side) with slight variation per attempt
        waypoints.push(destinationPoint(origin, halfRadiusKm, 90 + (attempt * 30)));

        // Add second waypoint at ~270° for more natural out-and-back
        waypoints.push(destinationPoint(origin, halfRadiusKm, 270 + (attempt * 30)));

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
