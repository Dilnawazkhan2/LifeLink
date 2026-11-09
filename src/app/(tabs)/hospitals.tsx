import { router } from 'expo-router';
import { Building2 } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { HospitalCard } from '@/components/cards/HospitalCard';
import { Button } from '@/components/common/Button';
import { Chip, ChipRow } from '@/components/common/Chip';
import { PageHeader } from '@/components/common/Headers';
import { EmptyState } from '@/components/common/Misc';
import { Screen } from '@/components/common/Screen';
import { SearchBar } from '@/components/common/SearchBar';
import { useApp } from '@/store/AppStore';
import { CITIES, type City, type HospitalType } from '@/types';

const TYPES: { key: HospitalType | 'All'; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'Private', label: 'Private' },
  { key: 'Public', label: 'Public' },
  { key: 'Semi-Government', label: 'Semi-Gov' },
];

export default function Hospitals() {
  const { state, actions } = useApp();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState<City | 'All'>('All');
  const [type, setType] = useState<HospitalType | 'All'>('All');
  const [bloodBankOnly, setBloodBankOnly] = useState(false);

  const q = query.trim().toLowerCase();
  const results = state.hospitals
    .filter((h) => (city === 'All' ? true : h.city === city))
    .filter((h) => (type === 'All' ? true : h.type === type))
    .filter((h) => (bloodBankOnly ? h.hasBloodBank : true))
    .filter((h) => !q || [h.name, h.address, h.city, ...h.services].some((f) => f.toLowerCase().includes(q)))
    .sort((a, b) => b.rating - a.rating);

  const reset = () => {
    setQuery('');
    setCity('All');
    setType('All');
    setBloodBankOnly(false);
  };

  return (
    <Screen withTabBar contentStyle={{ gap: 14 }} refreshing={state.syncing} onRefresh={state.mode === 'live' ? actions.refresh : undefined}>
      <View style={styles.bleed}>
        <PageHeader title="Partner Hospitals" subtitle={`${results.length} hospital${results.length === 1 ? '' : 's'} found`} />
      </View>

      <SearchBar value={query} onChangeText={setQuery} placeholder="Search hospitals..." />

      <ChipRow>
        {(['All', ...CITIES] as const).map((c) => (
          <Chip key={c} label={c} active={city === c} onPress={() => setCity(c)} />
        ))}
      </ChipRow>

      <ChipRow>
        {TYPES.map((t) => (
          <Chip key={t.key} variant="soft" label={t.label} active={type === t.key} onPress={() => setType(t.key)} />
        ))}
        <Chip variant="toggle" label="Blood Bank" active={bloodBankOnly} onPress={() => setBloodBankOnly((v) => !v)} />
      </ChipRow>

      {results.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No hospitals found"
          message="Try a different city, type or search term."
          action={<Button label="Clear filters" variant="soft" fullWidth={false} onPress={reset} style={{ marginTop: 8 }} />}
        />
      ) : (
        results.map((h) => <HospitalCard key={h.id} hospital={h} onPress={() => router.push(`/hospitals/${h.id}`)} />)
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bleed: { marginHorizontal: -20 },
});
