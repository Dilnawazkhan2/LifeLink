import { Redirect, Stack } from 'expo-router';

import { Colors } from '@/constants/colors';
import { useApp } from '@/store/AppStore';

export default function AuthLayout() {
  const { state } = useApp();
  if (state.isAuthenticated) return <Redirect href="/(tabs)" />;
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: Colors.surface } }} />;
}
