import type { StyleProp, ViewStyle } from 'react-native';

import type { GeoPoint } from '@/types';

/** Free OpenStreetMap vector tiles (OpenFreeMap), no API key. Attribution is shown by the map. */
export const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

/** Centre of Pakistan's population belt, used when nothing better is known. */
export const DEFAULT_CENTER: GeoPoint = { lat: 30.3753, lng: 69.3451 };

export type MapPointKind = 'donor' | 'request' | 'pin';

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  kind: MapPointKind;
  /** Short text inside the marker (blood group). */
  label?: string;
  /** Donor available / request critical → stronger colour. */
  emphasis?: boolean;
  selected?: boolean;
}

export interface LifeLinkMapProps {
  center: GeoPoint;
  zoom?: number;
  points?: MapPoint[];
  /** Blue dot for the user's own position. */
  userLocation?: GeoPoint | null;
  onPointPress?: (id: string) => void;
  onPress?: (point: GeoPoint) => void;
  /** Fires when the map stops moving; `byUser` is false for programmatic moves. */
  onCenterChange?: (point: GeoPoint, zoom: number, byUser: boolean) => void;
  /** Fixed pin in the middle of the map (location picker). */
  centerPin?: boolean;
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const markerColors = (p: MapPoint) =>
  p.kind === 'request'
    ? { bg: p.emphasis ? '#B91C1C' : '#E11D48', fg: '#FFFFFF', border: '#FFFFFF' }
    : p.kind === 'pin'
      ? { bg: '#C41E3A', fg: '#FFFFFF', border: '#FFFFFF' }
      : { bg: '#FFFFFF', fg: '#C41E3A', border: p.emphasis ? '#16A34A' : '#94A3B8' };
