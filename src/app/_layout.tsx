import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FeedbackProvider, useFeedback } from '@/components/common/Feedback';
import { Colors } from '@/constants/colors';
import { requestIdFrom } from '@/services/push';
import { AppProvider, setErrorReporter, useApp } from '@/store/AppStore';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

// Show emergency alerts as a banner even while the app is open.
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
}

/** Tapping an emergency notification opens its request (app in background, or launched from closed). */
function useNotificationRouting(ready: boolean, onReceive: () => void) {
  useEffect(() => {
    if (Platform.OS === 'web' || !ready) return;
    const open = (response: Notifications.NotificationResponse | null) => {
      const id = requestIdFrom(response);
      if (!id) return;
      router.push(`/requests/${id}`);
      Notifications.clearLastNotificationResponse();
    };
    open(Notifications.getLastNotificationResponse()); // launched by tapping a notification
    const tapped = Notifications.addNotificationResponseReceivedListener(open);
    const received = Notifications.addNotificationReceivedListener(() => onReceive()); // arrived while open
    return () => {
      tapped.remove();
      received.remove();
    };
  }, [ready, onReceive]);
}

function RootNavigator() {
  const { state, actions } = useApp();
  const { toast } = useFeedback();

  // Server errors from store actions surface as toasts.
  useEffect(() => setErrorReporter((message) => toast(message, 'error')), [toast]);

  useEffect(() => {
    if (state.hydrated) SplashScreen.hideAsync().catch(() => undefined);
  }, [state.hydrated]);

  useNotificationRouting(state.hydrated && state.isAuthenticated, actions.refresh);

  // Keep the native splash visible until persisted state is loaded.
  if (!state.hydrated) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: Colors.background },
        }}>
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="requests/new" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="location-picker" options={{ animation: 'slide_from_bottom' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <FeedbackProvider>
          <RootNavigator />
        </FeedbackProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
