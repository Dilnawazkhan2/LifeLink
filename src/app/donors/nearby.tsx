import { router } from 'expo-router';
import { CircleCheck, Hospital as HospitalIcon, List, LocateFixed, Map as MapIcon, MapPinned, Navigation, SearchX, ShieldCheck } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { BloodBadge } from '@/components/common/BloodBadge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Chip, ChipRow } from '@/components/common/Chip';
import { useFeedback } from '@/components/common/Feedback';
import { StackHeader } from '@/components/common/Headers';
import { EmptyState } from '@/components/common/Misc';
import { Screen } from '@/components/common/Screen';
import { LifeLinkMap, type MapPoint } from '@/components/map/LifeLinkMap';
import { Colors } from '@/constants/colors';
import * as api from '@/services/api';
import { directionsUrl, getCurrentLocation } from '@/services/location';
import { pickLocation } from '@/services/locationPick';
import { useApp } from '@/store/AppStore';
import { BLOOD_GROUPS, type BloodGroup, type GeoPoint, type NearbyDonor, type RequestLocation } from '@/types';

const RADII = [5, 10, 25, 50] as const;
// Fits the whole radius on a phone-width map.
const zoomFor = (km: number) => (km <= 5 ? 12 : km <= 10 ? 11 : km <= 25 ? 9.8 : 8.8);
const fmtKm = (km: number) => (km < 1 ? '< 1 km' : `≈ ${km < 10 ? km.toFixed(1) : Math.round(km)} km`);

/** Nearby Donors: map + list of donors who opted in, around the user's location (or a picked point). */
export default function NearbyDonors() {
  const { state, actions } = useApp();
  const { toast } = useFeedback();
  const live = state.mode === 'live';
  const [origin, setOrigin] = useState<{ point: GeoPoint; source: 'gps' | 'map' } | null>(null);
  const [radius, setRadius] = useState<number>(RADII.includes(state.settings.searchRadiusKm as 5) ? state.settings.searchRadiusKm : 10);
  const [group, setGroup] = useState<BloodGroup | 'All'>('All');
  const [view, setView] = useState<'map' | 'list'>('map');
  const [donors, setDonors] = useState<NearbyDonor[]>([]);
  const [requests, setRequests] = useState<RequestLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [problem, setProblem] = useState<string>();
  const [selected, setSelected] = useState<string>();

  const load = useCallback(
    async (at: GeoPoint, km: number, g: BloodGroup | 'All') => {
      if (!live) return;
      setLoading(true);
      try {
        const [d, r] = await Promise.all([
          api.fetchNearbyDonors(at.lat, at.lng, km, g === 'All' ? undefined : g),
          api.fetchRequestLocations(at, km),
        ]);
        setDonors(d);
        setRequests(r);
        setProblem(undefined);
      } catch (e) {
        setProblem(e instanceof Error ? e.message : 'Could not load nearby donors.');
      } finally {
        setLoading(false);
      }
    },
    [live],
  );

  type Origin = { point: GeoPoint; source: 'gps' | 'map' };
  // Loads are triggered by the user's actions (location, radius, blood group), not by an effect.
  const apply = (next: { origin?: Origin; radius?: number; group?: BloodGroup | 'All' }) => {
    const o = next.origin ?? origin;
    if (next.origin) setOrigin(next.origin);
    if (next.radius !== undefined) setRadius(next.radius);
    if (next.group !== undefined) setGroup(next.group);
    if (o) load(o.point, next.radius ?? radius, next.group ?? group);
  };

  const locate = async () => {
    setLocating(true);
    const r = await getCurrentLocation();
    setLocating(false);
    if (!r.ok) return setProblem(r.message);
    setSelected(undefined);
    apply({ origin: { point: r.point, source: 'gps' } });
    // An opted-in donor's stored position is refreshed only now, while they use this screen.
    if (live && state.settings.shareLocation) actions.shareMyLocation(r.point, 'gps', r.accuracyM).catch(() => undefined);
  };

  const chooseOnMap = async () => {
    const picked = await pickLocation({ initial: origin?.point, title: 'Search Around' });
    if (!picked) return;
    setSelected(undefined);
    apply({ origin: { point: picked.point, source: 'map' } });
  };

  const points = useMemo<MapPoint[]>(
    () => [
      ...donors.map((d) => ({
        id: `d:${d.id}`,
        lat: d.approx.lat,
        lng: d.approx.lng,
        kind: 'donor' as const,
        label: d.bloodGroup,
        emphasis: d.availability === 'available',
        selected: selected === `d:${d.id}`,
      })),
      ...requests.map((r) => ({
        id: `r:${r.id}`,
        lat: r.point.lat,
        lng: r.point.lng,
        kind: 'request' as const,
        label: r.bloodGroup,
        emphasis: r.urgency === 'critical',
        selected: selected === `r:${r.id}`,
      })),
    ],
    [donors, requests, selected],
  );

  const selDonor = selected?.startsWith('d:') ? donors.find((d) => `d:${d.id}` === selected) : undefined;
  const selRequest = selected?.startsWith('r:') ? requests.find((r) => `r:${r.id}` === selected) : undefined;

  const openDirections = async (p: GeoPoint) => {
    try {
      await Linking.openURL(directionsUrl(p));
    } catch {
      toast('Could not open maps', 'error');
    }
  };

  const subtitle = !origin
    ? 'Donors who share their approximate location'
    : `${donors.length} donor${donors.length === 1 ? '' : 's'} within ${radius} km${loading ? ' · updating…' : ''}`;

  return (
    <Screen header={<StackHeader title="Nearby Donors" subtitle={subtitle} onBack={() => router.back()} />} contentStyle={{ gap: 14 }}>
      {!live && (
        <Card>
          <Text style={styles.body}>The nearby map uses real donor locations, so it needs the LifeLink server. It is not available in demo mode.</Text>
        </Card>
      )}

      {live && !origin && (
        <Card style={{ gap: 14 }}>
          <View style={styles.explainHead}>
            <MapPinned size={26} color={Colors.primary} />
            <Text style={styles.explainTitle}>Find donors near you</Text>
          </View>
          <Text style={styles.body}>
            LifeLink uses your location only while this screen is open, to measure distances. Donors appear only if they chose to
            share their approximate area (about 1 km), never their exact position or phone number.
          </Text>
          {problem ? <Text style={styles.problem}>{problem}</Text> : null}
          <Button label="Use My Location" loading={locating} icon={<LocateFixed size={18} color={Colors.white} />} onPress={locate} />
          <Button label="Choose a Location on the Map" variant="soft" icon={<MapPinned size={18} color={Colors.primary} />} onPress={chooseOnMap} />
        </Card>
      )}

      {live && origin && (
        <>
          <ChipRow>
            {RADII.map((r) => (
              <Chip key={r} label={`${r} km`} active={radius === r} onPress={() => apply({ radius: r })} />
            ))}
            <Chip variant="soft" label="Map" active={view === 'map'} onPress={() => setView('map')} left={<MapIcon size={15} color={view === 'map' ? Colors.white : Colors.primary} />} />
            <Chip variant="soft" label="List" active={view === 'list'} onPress={() => setView('list')} left={<List size={15} color={view === 'list' ? Colors.white : Colors.primary} />} />
          </ChipRow>
          <ChipRow>
            {(['All', ...BLOOD_GROUPS] as const).map((g) => (
              <Chip key={g} label={g} active={group === g} onPress={() => apply({ group: g })} />
            ))}
          </ChipRow>
          <View style={styles.originRow}>
            <Text style={styles.originText}>{origin.source === 'gps' ? 'Around your current location' : 'Around the chosen location'}</Text>
            <Pressable onPress={locate} accessibilityRole="button" hitSlop={8}>
              <Text style={styles.link}>{locating ? 'Locating…' : 'My location'}</Text>
            </Pressable>
            <Pressable onPress={chooseOnMap} accessibilityRole="button" hitSlop={8}>
              <Text style={styles.link}>Change</Text>
            </Pressable>
          </View>
          {problem ? <Text style={styles.problem}>{problem}</Text> : null}

          {view === 'map' ? (
            <LifeLinkMap
              style={styles.map}
              center={origin.point}
              zoom={zoomFor(radius)}
              points={points}
              userLocation={origin.source === 'gps' ? origin.point : null}
              onPointPress={(id) => setSelected(id)}
              onPress={() => setSelected(undefined)}
              testID="nearby-map"
            />
          ) : null}

          {view === 'map' && selDonor ? (
            <DonorInfo donor={selDonor} onProfile={() => router.push(`/donors/${selDonor.id}`)} onDirections={() => openDirections(selDonor.approx)} />
          ) : null}
          {view === 'map' && selRequest ? (
            <Card style={{ gap: 10 }}>
              <View style={styles.infoHead}>
                <BloodBadge group={selRequest.bloodGroup} size="md" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>{selRequest.urgency === 'normal' ? 'Blood request' : `${selRequest.urgency === 'critical' ? 'Critical' : 'Urgent'} request`}</Text>
                  <Text style={styles.meta}>
                    {selRequest.units} unit{selRequest.units === 1 ? '' : 's'} · {selRequest.hospitalName}
                    {selRequest.distanceKm != null ? ` · ${fmtKm(selRequest.distanceKm)}` : ''}
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <Button label="View Request" size="md" fullWidth={false} style={{ flex: 1 }} onPress={() => router.push(`/requests/${selRequest.id}`)} />
                <Button label="Directions" variant="soft" size="md" fullWidth={false} style={{ flex: 1 }} icon={<Navigation size={17} color={Colors.primary} />} onPress={() => openDirections(selRequest.point)} />
              </View>
            </Card>
          ) : null}

          {view === 'list' || (!selDonor && !selRequest) ? (
            donors.length === 0 && !loading ? (
              <EmptyState
                icon={SearchX}
                title="No donors nearby yet"
                message={`No donor within ${radius} km has chosen to share their location. Try a larger radius.`}
              />
            ) : (
              donors.map((d) => (
                <DonorInfo key={d.id} donor={d} compact onProfile={() => router.push(`/donors/${d.id}`)} onDirections={() => openDirections(d.approx)} />
              ))
            )
          ) : null}

          {view === 'list' && requests.length > 0 ? (
            <>
              <Text style={styles.section}>Requests in this area</Text>
              {requests.map((r) => (
                <Pressable key={r.id} onPress={() => router.push(`/requests/${r.id}`)} accessibilityRole="button">
                  <Card style={styles.reqRow}>
                    <HospitalIcon size={20} color={Colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoTitle}>
                        {r.bloodGroup} · {r.units} unit{r.units === 1 ? '' : 's'}
                      </Text>
                      <Text style={styles.meta}>
                        {r.hospitalName}
                        {r.distanceKm != null ? ` · ${fmtKm(r.distanceKm)}` : ''}
                      </Text>
                    </View>
                  </Card>
                </Pressable>
              ))}
            </>
          ) : null}
        </>
      )}
    </Screen>
  );
}

function DonorInfo({ donor, compact, onProfile, onDirections }: { donor: NearbyDonor; compact?: boolean; onProfile: () => void; onDirections: () => void }) {
  const available = donor.availability === 'available';
  return (
    <Card style={{ gap: 10 }}>
      <View style={styles.infoHead}>
        <BloodBadge group={donor.bloodGroup} size="md" />
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.infoTitle} numberOfLines={1}>
              {donor.name}
            </Text>
            {donor.verified ? <ShieldCheck size={16} color={Colors.success} /> : null}
          </View>
          <Text style={styles.meta}>
            {fmtKm(donor.distanceKm)} · {[donor.area, donor.city].filter(Boolean).join(', ')}
          </Text>
          <View style={styles.nameRow}>
            <CircleCheck size={14} color={available ? Colors.success : Colors.textFaint} />
            <Text style={[styles.meta, { color: available ? Colors.success : Colors.textMuted }]}>{available ? 'Available' : donor.availability === 'resting' ? 'Resting' : 'Busy'}</Text>
          </View>
        </View>
      </View>
      <View style={styles.row}>
        <Button label="View Profile" size="md" variant={compact ? 'soft' : 'gradient'} fullWidth={false} style={{ flex: 1 }} onPress={onProfile} />
        <Button label="Directions" variant="soft" size="md" fullWidth={false} style={{ flex: 1 }} icon={<Navigation size={17} color={Colors.primary} />} onPress={onDirections} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15, lineHeight: 22, color: Colors.textSecondary },
  explainHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  explainTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  problem: { fontSize: 14, color: Colors.danger, fontWeight: '600' },
  originRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  originText: { flex: 1, fontSize: 14, color: Colors.textMuted },
  link: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  map: { height: 360 },
  infoHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, flexShrink: 1 },
  meta: { fontSize: 13, color: Colors.textMuted },
  row: { flexDirection: 'row', gap: 10 },
  section: { fontSize: 16, fontWeight: '800', color: Colors.text, marginTop: 6 },
  reqRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
