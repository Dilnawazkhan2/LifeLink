import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { AppState, Platform } from 'react-native';

/**
 * Backend selection (set in `.env`, see `.env.example`):
 *
 *   EXPO_PUBLIC_SUPABASE_URL unset or "demo" → DEMO mode: bundled mock data, no network (original behaviour).
 *   EXPO_PUBLIC_SUPABASE_URL = "local"       → LifeLink local dev server running on the computer that runs
 *                                              Metro (`npm run dev` in "LifeLink Platform"), port 54321.
 *   EXPO_PUBLIC_SUPABASE_URL = https://…     → your Supabase project. Also set EXPO_PUBLIC_SUPABASE_ANON_KEY
 *                                              (the publishable/anon key — never the service_role key).
 */
const RAW_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim();
const RAW_KEY = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '').trim();

/** Fixed key of the local dev server. Not a secret: it only works against the dev server. */
const LOCAL_DEV_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaWZlbGluay1kZXYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc2MjY0NjQwMCwiZXhwIjoyMDc3OTIwMDAwfQ.gSO7l0q-SKZg544S-_cLiUmtiHOGgi-CFDhkHr7HxoA';

function devHost(): string {
  // The computer running Metro: reachable from Expo Go on the same Wi-Fi.
  const hostUri = Constants.expoConfig?.hostUri ?? '';
  const fromMetro = hostUri.split(':')[0];
  if (fromMetro) return fromMetro;
  if (Platform.OS === 'web' && typeof window !== 'undefined') return window.location.hostname || '127.0.0.1';
  return Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1'; // Android emulator → host machine
}

function resolve(): { url: string; key: string } | null {
  if (!RAW_URL || RAW_URL === 'demo') return null;
  // Always the dev server's own key: .env may hold the cloud key, which the local server rejects.
  if (RAW_URL === 'local') return { url: `http://${devHost()}:54321`, key: LOCAL_DEV_KEY };
  if (!RAW_KEY) {
    console.warn('[LifeLink] EXPO_PUBLIC_SUPABASE_URL is set but EXPO_PUBLIC_SUPABASE_ANON_KEY is missing — running in demo mode.');
    return null;
  }
  return { url: RAW_URL.replace(/\/+$/, ''), key: RAW_KEY };
}

const config = resolve();

/** true when the app talks to the shared LifeLink backend (Supabase or the local dev server). */
export const isLive = config !== null;
export const backendUrl = config?.url ?? null;
export const backendLabel = !config ? 'Demo data (offline)' : RAW_URL === 'local' ? `Local dev server (${config.url})` : 'LifeLink cloud';

export const supabase: SupabaseClient | null = config
  ? createClient(config.url, config.key, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

// Refresh the session only while the app is in the foreground (Expo/Supabase guidance).
if (supabase && Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

export function requireClient(): SupabaseClient {
  if (!supabase) throw new Error('Backend not configured');
  return supabase;
}

/** Public URL of an object in the avatars bucket. */
export function avatarUrl(path?: string | null): string | undefined {
  if (!path || !supabase) return undefined;
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
}
