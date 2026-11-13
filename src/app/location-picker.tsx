import { router } from 'expo-router';
import { Check, LocateFixed, Search } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import { useFeedback } from '@/components/common/Feedback';
import { StackHeader } from '@/components/common/Headers';
import { DEFAULT_CENTER, LifeLinkMap } from '@/components/map/LifeLinkMap';
import { Colors } from '@/constants/colors';
import { cityCoords, getUserPosition } from '@/constants/cities';
import { describePoint, getCurrentLocation, searchPlace } from '@/services/location';
import { finishPick, pickerInitial } from '@/services/locationPick';
import { useApp } from '@/store/AppStore';
import type { GeoPoint } from '@/types';

/** Drag the map so the pin sits on the hospital / donation place, then confirm. */
export default function LocationPicker() {
  const insets = useSafeAreaInsets();
  const { state } = useApp();
  const { toast } = useFeedback();
  const [init] = useState(() => pickerInitial());
  const [start] = useState<{ center: GeoPoint; zoom: number }>(() => {
    if (init.point) return { center: init.point, zoom: 16 };
    const known = getUserPosition() ?? cityCoords(state.user.city);
    return known ? { center: known, zoom: 13 } : { center: DEFAULT_CENTER, zoom: 5 };
  });
  const [view, setView] = useState(start);
  const [me, setMe] = useState(() => getUserPosition());
  const [target, setTarget] = useState<GeoPoint>(start.center);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState<'gps' | 'search' | 'confirm' | null>(null);
  const confirmed = useRef(false);

  // Leaving without confirming resolves the pending pick with null.
  useEffect(
    () => () => {
      if (!confirmed.current) finishPick(null);
    },
    [],
  );

  const useGps = async () => {
    setBusy('gps');
    const r = await getCurrentLocation();
    setBusy(null);
    if (!r.ok) return toast(r.message, 'error');
    setMe(r.point);
    setView({ center: r.point, zoom: 16 });
    setTarget(r.point);
  };

  const search = async () => {
    setBusy('search');
    const hit = await searchPlace(query);
    setBusy(null);
    if (!hit) return toast('No place found. Try a hospital name with the city, or move the map.', 'info');
    setView({ center: hit, zoom: 16 });
    setTarget(hit);
  };

  const confirm = async () => {
    setBusy('confirm');
    const label = await describePoint(target);
    confirmed.current = true;
    finishPick({ point: target, label });
    router.back();
  };

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <View style={{ paddingTop: insets.top }}>
        <StackHeader title={init.title ?? 'Select Location'} subtitle="Move the map to place the pin" onBack={() => router.back()} />
      </View>

      {Platform.OS !== 'web' && (
        <View style={styles.searchRow}>
          <Search size={20} color={Colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search a hospital or address"
            placeholderTextColor={Colors.textFaint}
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={search}
            accessibilityLabel="Search a place"
          />
        </View>
      )}

      <LifeLinkMap
        style={styles.map}
        center={view.center}
        zoom={view.zoom}
        centerPin
        userLocation={me}
        onCenterChange={(p) => setTarget(p)}
        onPress={(p) => setView((v) => ({ center: p, zoom: Math.max(v.zoom, 14) }))}
        testID="location-picker-map"
      />

      <View style={styles.footer}>
        <Text style={styles.coords} accessibilityLabel="Selected coordinates">
          {target.lat.toFixed(5)}, {target.lng.toFixed(5)}
        </Text>
        <View style={styles.row}>
          <Button
            label="Use Current Location"
            variant="soft"
            size="md"
            fullWidth={false}
            style={{ flex: 1 }}
            loading={busy === 'gps'}
            icon={<LocateFixed size={18} color={Colors.primary} />}
            onPress={useGps}
          />
          <Button
            label="Confirm Location"
            size="md"
            fullWidth={false}
            style={{ flex: 1 }}
            loading={busy === 'confirm'}
            icon={<Check size={18} color={Colors.white} />}
            onPress={confirm}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
  },
  searchInput: { flex: 1, fontSize: 16, color: Colors.text },
  map: { flex: 1, marginHorizontal: 20, minHeight: 280 },
  footer: { padding: 20, gap: 12 },
  coords: { textAlign: 'center', color: Colors.textMuted, fontSize: 13, fontVariant: ['tabular-nums'] },
  row: { flexDirection: 'row', gap: 12 },
});
