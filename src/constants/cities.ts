/**
 * Approximate city-centre coordinates. Donors and requests in the backend carry a
 * city, not GPS coordinates, so distances shown in live mode are estimates from the
 * user's city centre (hospitals use their own coordinates when available).
 */
export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  karachi: { lat: 24.8607, lng: 67.0011 },
  lahore: { lat: 31.5204, lng: 74.3587 },
  islamabad: { lat: 33.6844, lng: 73.0479 },
  rawalpindi: { lat: 33.5651, lng: 73.0169 },
  hyderabad: { lat: 25.396, lng: 68.3578 },
  faisalabad: { lat: 31.4504, lng: 73.135 },
  multan: { lat: 30.1575, lng: 71.5249 },
  peshawar: { lat: 34.0151, lng: 71.5249 },
  quetta: { lat: 30.1798, lng: 66.975 },
  sukkur: { lat: 27.7052, lng: 68.8574 },
  sialkot: { lat: 32.4945, lng: 74.5229 },
  gujranwala: { lat: 32.1877, lng: 74.1945 },
};

const toRad = (d: number) => (d * Math.PI) / 180;

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export const cityCoords = (city?: string | null) => (city ? CITY_COORDS[city.trim().toLowerCase()] : undefined);

/**
 * The user's last known GPS position (set only after they allow location in the app).
 * When known, distances to places with real coordinates are measured from here
 * instead of the user's city centre.
 */
let userPosition: { lat: number; lng: number } | null = null;
export const setUserPosition = (p: { lat: number; lng: number } | null) => {
  userPosition = p;
};
export const getUserPosition = () => userPosition;

/**
 * Estimated distance in km from the user's city to a place.
 * Same city without precise coordinates → 0 ("In your city"); unknown → 9999.
 */
export function estimateDistanceKm(userCity: string | undefined, placeCity: string | undefined, point?: { lat?: number | null; lng?: number | null }): number {
  const from = (point?.lat != null && point?.lng != null ? userPosition : null) ?? cityCoords(userCity);
  if (from && point?.lat != null && point?.lng != null) return Math.round(haversineKm(from, { lat: Number(point.lat), lng: Number(point.lng) }) * 10) / 10;
  if (userCity && placeCity && userCity.trim().toLowerCase() === placeCity.trim().toLowerCase()) return 0;
  const to = cityCoords(placeCity);
  if (from && to) return Math.round(haversineKm(from, to));
  return 9999;
}
