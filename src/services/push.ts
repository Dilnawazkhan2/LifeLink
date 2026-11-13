import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import * as api from './api';

/**
 * Emergency push notifications (Expo Push Service → FCM on Android).
 * The token is stored in Supabase via register_push_token; delivery happens
 * server-side in the send-emergency-alerts Edge Function. Remote push needs a
 * development/EAS build (not Expo Go) with FCM credentials uploaded to EAS.
 */
const TOKEN_KEY = 'lifelink:push-token';
export const EMERGENCY_CHANNEL = 'emergency';

export type PushResult = { ok: true; token: string } | { ok: false; message: string };

export async function ensureEmergencyChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(EMERGENCY_CHANNEL, {
    name: 'Emergency blood requests',
    description: 'Urgent requests for your blood group near you',
    importance: AndroidImportance.MAX,
    vibrationPattern: [0, 300, 200, 300],
    lightColor: '#C41E3A',
    sound: 'default',
  });
}

/** Asks for permission (if needed), gets the Expo push token and stores it for this user. */
export async function enablePush(): Promise<PushResult> {
  if (Platform.OS === 'web') return { ok: false, message: 'Push notifications work in the Android app.' };
  if (!Device.isDevice) return { ok: false, message: 'Push notifications need a real phone.' };
  try {
    await ensureEmergencyChannel(); // Android 13+ shows the permission prompt only once a channel exists
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status;
    if (status !== 'granted') return { ok: false, message: 'Notifications are blocked. Allow them in Android settings to get emergency alerts.' };
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const token = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)).data;
    await api.registerPushToken(token, Platform.OS === 'ios' ? 'ios' : 'android');
    await AsyncStorage.setItem(TOKEN_KEY, token).catch(() => undefined);
    return { ok: true, token };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'Could not register for push notifications.' };
  }
}

/** Removes this device's token for the signed-in user (logout / toggle off). */
export async function disablePush() {
  const token = await AsyncStorage.getItem(TOKEN_KEY).catch(() => null);
  if (!token) return;
  await api.unregisterPushToken(token).catch(() => undefined);
  await AsyncStorage.removeItem(TOKEN_KEY).catch(() => undefined);
}

/** Re-register when Expo/FCM rotates the token. Returns an unsubscribe function. */
export function watchTokenChanges(): () => void {
  if (Platform.OS === 'web') return () => undefined;
  const sub = Notifications.addPushTokenListener(() => {
    enablePush().catch(() => undefined);
  });
  return () => sub.remove();
}

/** The request id carried by an emergency notification, if any. */
export function requestIdFrom(response: Notifications.NotificationResponse | null | undefined): string | undefined {
  const id = response?.notification.request.content.data?.request_id;
  return typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id) ? id : undefined;
}
