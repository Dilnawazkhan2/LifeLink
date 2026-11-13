import { router } from 'expo-router';

import type { GeoPoint } from '@/types';

/**
 * Opens the map picker screen and resolves with the confirmed point (or null when
 * the user leaves without confirming). Only one pick can be pending at a time.
 */
export interface PickedLocation {
  point: GeoPoint;
  label?: string;
}

let pending: ((value: PickedLocation | null) => void) | null = null;
let initial: { point?: GeoPoint; title?: string } = {};

export function pickLocation(options: { initial?: GeoPoint; title?: string } = {}): Promise<PickedLocation | null> {
  pending?.(null);
  initial = { point: options.initial, title: options.title };
  return new Promise((resolve) => {
    pending = resolve;
    router.push('/location-picker');
  });
}

/** Used by the picker screen. */
export const pickerInitial = () => initial;
export function finishPick(value: PickedLocation | null) {
  const resolve = pending;
  pending = null;
  resolve?.(value);
}
