import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FeedbackProvider } from '@/components/common/Feedback';
import { Colors } from '@/constants/colors';
import { AppProvider, useApp } from '@/store/AppStore';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootNavigator() {
  const { state } = useApp();

  useEffect(() => {
    if (state.hydrated) SplashScreen.hideAsync().catch(() => undefined);
  }, [state.hydrated]);

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
