import { router } from 'expo-router';
import { CircleAlert, ClipboardList, List, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RequestCard } from '@/components/cards/RequestCard';
import { Button } from '@/components/common/Button';
import { Chip, ChipRow } from '@/components/common/Chip';
import { HeaderIconButton, PageHeader } from '@/components/common/Headers';
import { EmptyState } from '@/components/common/Misc';
import { Screen } from '@/components/common/Screen';
import { Colors } from '@/constants/colors';
import { useRequestActions } from '@/hooks/useRequestActions';
import { useApp, useStats } from '@/store/AppStore';
import { BLOOD_GROUPS, type BloodGroup, type BloodRequest } from '@/types';

type StatusFilter = 'all' | 'urgent' | 'active' | 'fulfilled';

const urgencyRank = { critical: 0, urgent: 1, normal: 2 } as const;

export default function Requests() {
  const { state, actions } = useApp();
  const { urgent } = useStats();
  const { contactRequester, hasResponded } = useRequestActions();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [group, setGroup] = useState<BloodGroup | 'All'>('All');
  const [mineOnly, setMineOnly] = useState(false);

  const matchStatus = (r: BloodRequest) =>
    status === 'all'
      ? true
      : status === 'urgent'
        ? r.status === 'active' && r.urgency !== 'normal'
        : r.status === status;

  const results = state.requests
    .filter(matchStatus)
    .filter((r) => (group === 'All' ? true : r.bloodGroup === group))
    .filter((r) => (mineOnly ? r.isMine || hasResponded(r.id) : true))
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
      return urgencyRank[a.urgency] - urgencyRank[b.urgency] || Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });

  return (
    // Pull-to-refresh (live mode), same as the Donors tab: a fallback if a realtime event is missed.
    <Screen withTabBar contentStyle={{ gap: 14 }} refreshing={state.syncing} onRefresh={state.mode === 'live' ? actions.refresh : undefined}>
      <View style={{ marginHorizontal: -20 }}>
        <PageHeader
          title={mineOnly ? 'My Requests' : 'Blood Requests'}
          subtitle={
            urgent > 0 ? (
              <View style={styles.urgentPill}>
                <CircleAlert size={16} color={Colors.white} fill="#EF4444" />
                <Text style={styles.urgentText}>{urgent} urgent</Text>
              </View>
            ) : (
              <Text style={styles.subtitle}>No urgent requests</Text>
            )
          }
          right={
            <>
              <HeaderIconButton
                tone={mineOnly ? 'red' : 'pink'}
                label={mineOnly ? 'Show all requests' : 'Show my requests'}
                onPress={() => setMineOnly((v) => !v)}
                style={styles.headerBtn}>
                <List size={24} color={mineOnly ? Colors.white : Colors.primary} />
              </HeaderIconButton>
              <HeaderIconButton tone="red" label="Create blood request" onPress={() => router.push('/requests/new')} style={styles.headerBtn}>
                <Plus size={28} color={Colors.white} />
              </HeaderIconButton>
            </>
          }
        />
      </View>

      <ChipRow>
        <Chip label="All" active={status === 'all'} onPress={() => setStatus('all')} />
        <Chip label="Urgent" count={urgent} active={status === 'urgent'} onPress={() => setStatus('urgent')} />
        <Chip label="Active" active={status === 'active'} onPress={() => setStatus('active')} />
        <Chip label="Fulfilled" active={status === 'fulfilled'} onPress={() => setStatus('fulfilled')} />
      </ChipRow>

      <ChipRow>
        {(['All', ...BLOOD_GROUPS] as const).map((g) => (
          <Chip key={g} label={g} active={group === g} onPress={() => setGroup(g)} />
        ))}
      </ChipRow>

      {results.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No Requests Found"
          message={mineOnly ? "You haven't posted or accepted any requests yet." : 'No blood requests match these filters right now.'}
          action={<Button label="Create Request" fullWidth={false} onPress={() => router.push('/requests/new')} style={{ marginTop: 8 }} />}
        />
      ) : (
        results.map((r) => (
          <RequestCard
            key={r.id}
            request={r}
            responded={hasResponded(r.id)}
            onPress={() => router.push(`/requests/${r.id}`)}
            onContact={() => contactRequester(r)}
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  urgentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 15,
    marginTop: 8,
  },
  urgentText: { color: Colors.danger, fontWeight: '700', fontSize: 15 },
  subtitle: { fontSize: 15, color: Colors.textMuted, marginTop: 4 },
  headerBtn: { width: 54, height: 54, borderRadius: 18 },
});
