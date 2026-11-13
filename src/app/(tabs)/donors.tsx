import { router } from 'expo-router';
import { MapPin, SearchX } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DonorCard } from '@/components/cards/DonorCard';
import { Chip, ChipRow } from '@/components/common/Chip';
import { PageHeader } from '@/components/common/Headers';
import { EmptyState } from '@/components/common/Misc';
import { Screen } from '@/components/common/Screen';
import { SearchBar } from '@/components/common/SearchBar';
import { Button } from '@/components/common/Button';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/theme';
import { useApp } from '@/store/AppStore';
import { BLOOD_GROUPS, type BloodGroup } from '@/types';

type SortKey = 'distance' | 'donations' | 'rating';

export default function Donors() {
  const { state, actions } = useApp();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<BloodGroup | 'All'>('All');
  const [sort, setSort] = useState<SortKey>('distance');
  const [availableOnly, setAvailableOnly] = useState(false);

  const q = query.trim().toLowerCase();
  const results = state.donors
    .filter((d) => (group === 'All' ? true : d.bloodGroup === group))
    .filter((d) => (availableOnly ? d.availability === 'available' : true))
    .filter((d) => !q || [d.name, d.city, d.area, d.bloodGroup].some((f) => f.toLowerCase().includes(q)))
    .sort((a, b) =>
      sort === 'distance' ? a.distanceKm - b.distanceKm : sort === 'donations' ? b.donations - a.donations : b.rating - a.rating,
    );

  const resetFilters = () => {
    setQuery('');
    setGroup('All');
    setAvailableOnly(false);
  };

  return (
    <Screen withTabBar contentStyle={{ gap: 14 }} refreshing={state.syncing} onRefresh={state.mode === 'live' ? actions.refresh : undefined}>
      <View style={{ marginHorizontal: -20 }}>
        <PageHeader
          title="Find Donors"
          subtitle={`${results.length} donor${results.length === 1 ? '' : 's'} found`}
          right={
            <Pressable
              onPress={() => router.push('/donors/nearby')}
              style={({ pressed }) => [styles.nearby, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
              accessibilityLabel="Nearby donors on a map">
              <MapPin size={20} color={Colors.white} />
              <Text style={styles.nearbyText}>Nearby</Text>
            </Pressable>
          }
        />
      </View>

      <SearchBar value={query} onChangeText={setQuery} placeholder="Search by name, city, area..." />

      <ChipRow>
        {(['All', ...BLOOD_GROUPS] as const).map((g) => (
          <Chip key={g} label={g} active={group === g} onPress={() => setGroup(g)} />
        ))}
      </ChipRow>

      <ChipRow>
        <Text style={styles.sortLabel}>Sort:</Text>
        <Chip variant="soft" label="Distance" active={sort === 'distance'} onPress={() => setSort('distance')} />
        <Chip variant="soft" label="Donations" active={sort === 'donations'} onPress={() => setSort('donations')} />
        <Chip variant="soft" label="Rating" active={sort === 'rating'} onPress={() => setSort('rating')} />
        <Chip variant="toggle" label="Available" active={availableOnly} onPress={() => setAvailableOnly((v) => !v)} />
      </ChipRow>

      {results.length === 0 ? (
        state.donors.length === 0 ? (
          // Nothing to filter: the server returned no eligible donors at all.
          <EmptyState icon={SearchX} title="No donors yet" message="No donors are registered yet. Approved donors will appear here." />
        ) : (
          <EmptyState
            icon={SearchX}
            title="No donors found"
            message="Try adjusting your filters, or tap Nearby to search on the map."
            action={<Button label="Clear filters" variant="soft" fullWidth={false} onPress={resetFilters} style={{ marginTop: 8 }} />}
          />
        )
      ) : (
        results.map((d) => <DonorCard key={d.id} donor={d} onPress={() => router.push(`/donors/${d.id}`)} />)
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  nearby: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    height: 48,
    borderRadius: 16,
    ...Shadows.primary,
  },
  nearbyText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  sortLabel: { fontSize: 15, color: Colors.textMuted, marginRight: 2 },
});
