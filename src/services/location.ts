import * as Location from 'expo-location';
import { Platform } from 'react-native';

import { setUserPosition } from '@/constants/cities';
import type { GeoPoint } from '@/types';

/**
 * Foreground-only location (no background tracking; the app config does not
 * request background permission). Every caller shows its own "why" text before
 * calling `getCurrentLocation()`, and offers a manual map pick when it fails.
 */
export type LocationResult =
  | { ok: true; point: GeoPoint; accuracyM?: number }
  | { ok: false; reason: 'denied' | 'services_off' | 'unavailable'; message: string };

export async function getCurrentLocation(): Promise<LocationResult> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') {
      return { ok: false, reason: 'denied', message: 'Location permission was not given. You can choose the location on the map instead.' };
    }
    if (Platform.OS !== 'web' && !(await Location.hasServicesEnabledAsync())) {
      try {
        if (Platform.OS === 'android') await Location.enableNetworkProviderAsync(); // asks the user to turn location on
      } catch {
        return { ok: false, reason: 'services_off', message: 'Location (GPS) is turned off. Turn it on, or choose the location on the map.' };
      }
    }
    let pos: Location.LocationObject | null = null;
    try {
      pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    } catch {
      pos = await Location.getLastKnownPositionAsync({ maxAge: 10 * 60_000 }).catch(() => null);
    }
    if (!pos) return { ok: false, reason: 'unavailable', message: 'Could not get your location. Try again or choose it on the map.' };
    const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    setUserPosition(point);
    return { ok: true, point, accuracyM: pos.coords.accuracy ?? undefined };
  } catch (e) {
    return { ok: false, reason: 'unavailable', message: e instanceof Error ? e.message : 'Could not get your location.' };
  }
}

/** Short human label for a point ("Clifton, Karachi"); undefined where reverse geocoding is unavailable (web). */
export async function describePoint(point: GeoPoint): Promise<string | undefined> {
  if (Platform.OS === 'web') return undefined;
  try {
    const [a] = await Location.reverseGeocodeAsync({ latitude: point.lat, longitude: point.lng });
    if (!a) return undefined;
    const first = a.name && !/^\d+$/.test(a.name) ? a.name : a.street ?? a.district ?? undefined;
    const second = a.district && a.district !== first ? a.district : a.city ?? a.subregion ?? undefined;
    return [first, second].filter(Boolean).join(', ').slice(0, 200) || undefined;
  } catch {
    return undefined;
  }
}

/** Address / place search (native only). */
export async function searchPlace(query: string): Promise<GeoPoint | null> {
  if (Platform.OS === 'web' || query.trim().length < 3) return null;
  try {
    const [hit] = await Location.geocodeAsync(query.trim());
    return hit ? { lat: hit.latitude, lng: hit.longitude } : null;
  } catch {
    return null;
  }
}

/** Google Maps directions (opens the Maps app when installed, otherwise the browser). */
export const directionsUrl = (p: GeoPoint) => `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
