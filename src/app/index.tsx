import { Redirect } from 'expo-router';

import { useApp } from '@/store/AppStore';

/** Entry point: routes to onboarding, login or the main tabs based on local state. */
export default function Index() {
  const { state } = useApp();
  if (!state.hasOnboarded) return <Redirect href="/onboarding" />;
  if (!state.isAuthenticated) return <Redirect href="/login" />;
  return <Redirect href="/(tabs)" />;
}
