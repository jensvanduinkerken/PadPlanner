export interface ORSRoute {
  type: string;
  features: Array<{
    type: string;
    properties: {
      segments: Array<{
        distance: number;
        ascent?: number;
        descent?: number;
      }>;
      elevation?: number[];
    };
    geometry: {
      coordinates: [number, number][];
      type: string;
    };
  }>;
}

export interface RouteResponse {
  coordinates: [number, number][];
  distance: number;
  elevation?: {
    gain: number;
    loss: number;
    min: number;
    max: number;
    profile: number[];
  };
  speedLimits?: number[];
  duration?: number;
}

export interface RoundTripOptions {
  length: number;
  points?: number;
  seed?: number;
}

export interface RoutePreferences {
  avoidSteps?: boolean;
  avoidHighways?: boolean;
  avoidUnpaved?: boolean;
  complexity?: "simple" | "moderate" | "complex";
}

/**
 * Generate a round-trip route using ORS native round-trip API
 */
export async function generateRoundTripRoute(
  startLat: number,
  startLng: number,
  targetDistance: number,
  apiKey: string,
  numPoints?: number,
  seed?: number,
  preferences?: RoutePreferences,
  profile: "foot-walking" | "driving-car" = "foot-walking"
): Promise<RouteResponse> {
  const actualNumPoints = numPoints ?? 6;
  const url =
    `https://api.openrouteservice.org/v2/directions/${profile}/geojson`;

  // Build avoid_features based on user preferences and profile
  const avoidFeatures: string[] = ["ferries"];
  if (profile === "foot-walking") {
    // For walking, avoid steps by default
    avoidFeatures.push("steps");
    if (preferences?.avoidHighways) avoidFeatures.push("highways");
  }
  // For driving-car, keep minimal avoid_features to ensure route generation works

  // Adjust numPoints based on complexity preference
  let adjustedNumPoints = actualNumPoints;
  if (preferences?.complexity === "simple")
    adjustedNumPoints = Math.max(3, actualNumPoints - 2);
  if (preferences?.complexity === "complex")
    adjustedNumPoints = Math.min(12, actualNumPoints + 3);

  // Build extra_info based on profile
  // Note: ORS API does not support maxspeed in extra_info
  const extraInfo = ["surface", "waytype", "steepness"];

  const requestBody = {
    coordinates: [[startLng, startLat]],
    preference: "recommended",
    elevation: true,
    extra_info: extraInfo,
    options: {
      round_trip: {
        length: targetDistance,
        points: adjustedNumPoints,
        seed: seed ?? Math.floor(Math.random() * 100000),
      },
      avoid_features: avoidFeatures,
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept:
          "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
        Authorization: apiKey,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ORS API error: ${response.status} - ${errorText}`);
    }

    const data: ORSRoute = await response.json();

    if (!data.features || data.features.length === 0) {
      throw new Error("No route found");
    }

    const feature = data.features[0];
    const coordinates = feature.geometry.coordinates;
    const totalDistance = feature.properties.segments.reduce(
      (sum, segment) => sum + segment.distance,
      0
    );

    const elevation = extractElevationData(data);

    // Extract speed limits and duration for driving routes
    let speedLimits: number[] | undefined;
    let duration: number | undefined;
    if (profile === "driving-car") {
      speedLimits = extractSpeedLimits(feature.properties);
      duration = extractDuration(feature.properties);
    }

    return {
      coordinates,
      distance: totalDistance,
      elevation,
      speedLimits,
      duration,
    };
  } catch (error) {
    console.error("Error calling ORS round-trip API:", error);
    throw error;
  }
}

/**
 * Generate a walking route using OpenRouteService
 */
export async function generateWalkingRoute(
  waypoints: [number, number][],
  apiKey: string,
  profile: "foot-walking" | "driving-car" = "foot-walking"
): Promise<RouteResponse> {
  const url =
    `https://api.openrouteservice.org/v2/directions/${profile}/geojson`;

  // Build extra_info based on profile
  // Note: ORS API does not support maxspeed in extra_info
  const extraInfo = ["surface", "waytype", "steepness"];

  // Build avoid_features based on profile
  const avoidFeatures = ["ferries"];
  if (profile === "foot-walking") {
    avoidFeatures.push("steps");
  }
  // For driving-car, keep minimal avoid_features

  const requestBody = {
    coordinates: waypoints,
    elevation: true,
    extra_info: extraInfo,
    options: {
      avoid_features: avoidFeatures,
    },
    preference: "recommended",
    units: "km",
    continue_straight: true,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept:
          "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
        Authorization: apiKey,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ORS API error: ${response.status} - ${errorText}`);
    }

    const data: ORSRoute = await response.json();

    if (!data.features || data.features.length === 0) {
      throw new Error("No route found");
    }

    const feature = data.features[0];
    const coordinates = feature.geometry.coordinates;
    const totalDistance = feature.properties.segments.reduce(
      (sum, segment) => sum + segment.distance,
      0
    );

    const elevation = extractElevationData(data);

    // Extract speed limits and duration for driving routes
    let speedLimits: number[] | undefined;
    let duration: number | undefined;
    if (profile === "driving-car") {
      speedLimits = extractSpeedLimits(feature.properties);
      duration = extractDuration(feature.properties);
    }

    return {
      coordinates,
      distance: totalDistance,
      elevation,
      speedLimits,
      duration,
    };
  } catch (error) {
    console.error("Error calling ORS API:", error);
    throw error;
  }
}

/**
 * Extract speed limits from ORS route response (for driving-car profile)
 */
function extractSpeedLimits(
  properties: {
    segments: Array<{
      distance: number;
      ascent?: number;
      descent?: number;
      maxspeed?: number[];
    }>;
  }
): number[] {
  const speedLimits: number[] = [];

  if (properties.segments) {
    properties.segments.forEach((segment) => {
      if (segment.maxspeed && Array.isArray(segment.maxspeed)) {
        // ORS returns maxspeed for each coordinate in the segment
        speedLimits.push(...segment.maxspeed);
      }
    });
  }

  return speedLimits.length > 0 ? speedLimits : [];
}

/**
 * Extract duration from ORS route response (for driving-car profile)
 */
function extractDuration(
  properties: {
    segments: Array<{
      distance: number;
      ascent?: number;
      descent?: number;
      duration?: number;
    }>;
  }
): number | undefined {
  let totalDuration = 0;

  if (properties.segments) {
    properties.segments.forEach((segment) => {
      if (segment.duration !== undefined) {
        totalDuration += segment.duration;
      }
    });
  }

  return totalDuration > 0 ? totalDuration : undefined;
}

/**
 * Extract elevation data from ORS route response
 */
function extractElevationData(route: ORSRoute):
  | {
      gain: number;
      loss: number;
      min: number;
      max: number;
      profile: number[];
    }
  | undefined {
  try {
    const feature = route.features?.[0];
    if (!feature) return undefined;

    // Extract elevation profile if available
    const elevationData = (feature.properties as { elevation?: number[] })
      ?.elevation;
    let profile: number[] = [];
    let min = Infinity;
    let max = -Infinity;

    if (Array.isArray(elevationData)) {
      profile = elevationData;
      min = Math.min(...elevationData);
      max = Math.max(...elevationData);
    }

    // Sum up elevation gain/loss from all segments
    let totalGain = 0;
    let totalLoss = 0;

    feature.properties.segments.forEach(
      (segment: { ascent?: number; descent?: number }) => {
        if (segment.ascent) totalGain += segment.ascent;
        if (segment.descent) totalLoss += segment.descent;
      }
    );

    if (totalGain > 0 || totalLoss > 0 || profile.length > 0) {
      return {
        gain: Math.round(totalGain),
        loss: Math.round(totalLoss),
        min: min === Infinity ? 0 : Math.round(min),
        max: max === -Infinity ? 0 : Math.round(max),
        profile,
      };
    }

    return undefined;
  } catch (error) {
    console.error("Error extracting elevation data:", error);
    return undefined;
  }
}
