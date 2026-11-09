import AsyncStorage from '@react-native-async-storage/async-storage';

import { isLive } from './backend';

// Demo and live data are cached under different keys so switching modes never mixes them.
const KEY = isLive ? 'lifelink:state:live:v1' : 'lifelink:state:v1';

export async function loadSnapshot<T>(): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function saveSnapshot<T>(value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // Persistence is best-effort; the app keeps working in memory.
  }
}

export async function clearSnapshot(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
