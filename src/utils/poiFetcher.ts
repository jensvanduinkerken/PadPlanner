import type { LatLng } from '../types/route';

// Overpass API endpoint
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

export interface POI {
  lat: number;
  lng: number;
  name: string;
  type: string;
}

/**
 * Fetch Points of Interest (parks, monuments, etc) using Overpass API
 * Searches in a radius around the origin point
 */
export async function fetchPOIs(origin: LatLng, radiusKm: number, limit: number = 8): Promise<POI[]> {
  try {
    // Convert km to degrees (rough approximation: 1 degree ≈ 111 km)
    const radiusDegrees = radiusKm / 111;

    // Overpass QL query to find parks, monuments, and other interesting places
    // Prioritizes walkable areas
    const query = `
      [bbox:${origin.lat - radiusDegrees},${origin.lng - radiusDegrees},${origin.lat + radiusDegrees},${origin.lng + radiusDegrees}];
      (
        node["tourism"="attraction"];
        node["leisure"="park"];
        node["leisure"="garden"];
        node["amenity"="restaurant"];
        node["amenity"="cafe"];
        node["historic"="monument"];
        node["natural"="water"];
        node["historic"="castle"];
      );
      out center ${limit};
    `;

    const response = await fetch(OVERPASS_API, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      console.warn('Overpass API error, falling back to circular routing');
      return [];
    }

    const data = (await response.json()) as {
      elements?: Array<{
        lat?: number;
        lon?: number;
        center?: { lat: number; lon: number };
        tags?: { name?: string; [key: string]: string | undefined };
      }>;
    };

    if (!data.elements || data.elements.length === 0) {
      return [];
    }

    // Extract POI coordinates and names
    const pois: POI[] = data.elements
      .map((element) => {
        const lat = element.center?.lat ?? element.lat;
        const lng = element.center?.lon ?? element.lon;
        const name = element.tags?.name || 'Point of Interest';
        const type = getPoiType(element.tags);

        if (!lat || !lng) return null;

        return {
          lat,
          lng,
          name,
          type,
        };
      })
      .filter((poi) => poi !== null) as POI[];

    // Return top POIs, sorted by distance
    return pois.slice(0, limit).sort((a, b) => {
      const distA = calculateDistance(origin, { lat: a.lat, lng: a.lng });
      const distB = calculateDistance(origin, { lat: b.lat, lng: b.lng });
      return distA - distB;
    });
  } catch (error) {
    console.error('Failed to fetch POIs:', error);
    return [];
  }
}

/**
 * Get the type of POI for better categorization
 */
function getPoiType(tags?: { [key: string]: string | undefined }): string {
  if (!tags) return 'Unknown';
  if (tags.leisure === 'park') return 'Park';
  if (tags.leisure === 'garden') return 'Garden';
  if (tags.tourism === 'attraction') return 'Attraction';
  if (tags.historic) return 'Historic Site';
  if (tags.natural) return 'Natural';
  if (tags.amenity) return 'Amenity';
  return 'Place';
}

/**
 * Calculate distance between two points in km (Haversine formula)
 */
function calculateDistance(point1: LatLng, point2: LatLng): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Select waypoints from POIs by distributing them evenly around the circle
 */
export function selectWaypointsFromPOIs(pois: POI[], count: number = 6): LatLng[] {
  if (pois.length === 0) {
    return [];
  }

  // If we have fewer POIs than requested, use what we have
  if (pois.length <= count) {
    return pois.map((poi) => ({ lat: poi.lat, lng: poi.lng }));
  }

  // Select evenly distributed POIs
  const selectedPOIs: POI[] = [];
  const step = Math.floor(pois.length / count);

  for (let i = 0; i < count && i * step < pois.length; i++) {
    selectedPOIs.push(pois[i * step]);
  }

  return selectedPOIs.map((poi) => ({ lat: poi.lat, lng: poi.lng }));
}
