export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteRequest {
  origin: LatLng;
  desiredMinutes: number;
}

export interface RouteResult {
  coordinates: LatLng[];
  waypoints: LatLng[];
  actualDistanceMeters: number;
  actualDurationSeconds: number;
}
