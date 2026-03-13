import type { LatLng } from '../types/route';

const EARTH_RADIUS_KM = 6371;
const WALKING_SPEED_KMH = 5;

export function targetDistanceKm(minutes: number): number {
  return (minutes / 60) * WALKING_SPEED_KMH;
}

export function generateWaypoints(
  origin: LatLng,
  radiusKm: number,
  count: number = 4
): LatLng[] {
  const waypoints: LatLng[] = [];

  for (let i = 0; i < count; i++) {
    const baseBearing = (360 / count) * i;
    const jitter = Math.random() * 30 - 15; // ±15°
    const bearingDeg = baseBearing + jitter;

    const point = destinationPoint(origin, radiusKm, bearingDeg);
    waypoints.push(point);
  }

  return waypoints;
}

export function destinationPoint(
  origin: LatLng,
  distanceKm: number,
  bearingDeg: number
): LatLng {
  const lat1Rad = toRad(origin.lat);
  const lon1Rad = toRad(origin.lng);
  const bearingRad = toRad(bearingDeg);
  const angularDistance = distanceKm / EARTH_RADIUS_KM;

  const lat2Rad = Math.asin(
    Math.sin(lat1Rad) * Math.cos(angularDistance) +
      Math.cos(lat1Rad) * Math.sin(angularDistance) * Math.cos(bearingRad)
  );

  const lon2Rad =
    lon1Rad +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1Rad),
      Math.cos(angularDistance) - Math.sin(lat1Rad) * Math.sin(lat2Rad)
    );

  return {
    lat: toDeg(lat2Rad),
    lng: toDeg(lon2Rad),
  };
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}
