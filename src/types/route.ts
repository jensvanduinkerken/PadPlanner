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
  actualDistanceMeters: number;
  actualDurationSeconds: number;
}
