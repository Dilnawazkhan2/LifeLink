import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Bell, CircleCheck, Clock, MapPin, MessageCircleMore, Users, ChevronRight, Zap } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActivityRow, DonationTimeline, NearbyRequestRow, PulseIcon } from '@/components/cards/ListItems';
import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/common/Card';
import { AppSwitch, IconTile, SectionHeader } from '@/components/common/Misc';
import { Screen } from '@/components/common/Screen';
import { BloodDropIcon, MedicalIcon } from '@/components/icons';
import { Colors, Gradients } from '@/constants/colors';
import { SCREEN_PADDING, Shadows } from '@/constants/theme';
import { useRequestActions } from '@/hooks/useRequestActions';
import { useApp, useEligibility, useStats } from '@/store/AppStore';
import { daysUntil, formatMonthDayYear, getGreeting, parseDate } from '@/utils/date';
import { firstName } from '@/utils/format';

export default function Home() {
  const { state, actions } = useApp();
  const stats = useStats();
  const { eligible, nextEligible } = useEligibility();
  const { respond, hasResponded } = useRequestActions();
  const [refreshing, setRefreshing] = useState(false);
  const { user } = state;

  const nearby = state.requests
    .filter((r) => r.status === 'active' && !r.isMine && r.distanceKm <= state.settings.searchRadiusKm)
    .sort((a, b) => {
      const rank = (u: string) => (u === 'normal' ? 1 : 0);
      return rank(a.urgency) - rank(b.urgency) || a.distanceKm - b.distanceKm;
    })
    .slice(0, 3);

  const recentDonations = [...state.donations].sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime()).slice(0, 3);
  const activity = state.notifications.slice(0, 3);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  };

  const header = (
    <View style={styles.header}>
      <Pressable onPress={() => router.navigate('/(tabs)/profile')} accessibilityLabel="Open profile">
        <Avatar name={user.name} uri={user.avatarUri} size={46} tone={{ bg: '#FCE7F3', text: '#E11D74' }} ringColor={Colors.primary} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.name}>{firstName(user.name)} 👋</Text>
      </View>
      <Pressable onPress={() => router.push('/notifications')} style={styles.bell} accessibilityLabel={`Notifications, ${stats.unread} unread`}>
        <Bell size={24} color={Colors.text} strokeWidth={1.8} />
        {stats.unread > 0 && (
          <View style={styles.bellBadge}>
            <Text style={styles.bellBadgeText}>{stats.unread > 9 ? '9+' : stats.unread}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );

  return (
    <Screen header={header} withTabBar refreshing={refreshing} onRefresh={refresh} contentStyle={{ gap: 16, paddingTop: 6 }}>
      {/* Blood type card */}
      <LinearGradient colors={[Gradients.primary[0], Gradients.primary[1], Gradients.primary[2]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bloodCard}>
        <View style={[styles.ring, { width: 240, height: 240, top: -30, right: -50 }]} />
        <View style={[styles.ring, { width: 160, height: 160, top: 10, right: -10 }]} />
        <View style={[styles.ring, { width: 200, height: 200, bottom: -110, left: -50 }]} />

        <View style={styles.bloodTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bloodLabel}>YOUR BLOOD TYPE</Text>
            <View style={styles.bloodRow}>
              <Text style={styles.bloodGroup}>{user.bloodGroup}</Text>
              {user.verified && (
                <View style={styles.verified}>
                  <CircleCheck size={16} color={Colors.primary} fill={Colors.white} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
            <View style={styles.locationRow}>
              <MapPin size={15} color="rgba(255,255,255,0.8)" />
              <Text style={styles.location} numberOfLines={1}>
                {user.area}, {user.city}
              </Text>
            </View>
          </View>
          <Pressable style={styles.donationsCol} onPress={() => router.push('/profile/donations')} accessibilityLabel="View donation history">
            <View style={styles.dropCircle}>
              <BloodDropIcon size={30} color={Colors.white} accent="#D9566A" />
            </View>
            <Text style={styles.donationsCount}>{stats.donations}</Text>
            <Text style={styles.donationsLabel}>Donations</Text>
          </Pressable>
        </View>

        <View style={styles.availability}>
          <View style={[styles.availDot, { backgroundColor: user.availability === 'available' ? '#4ADE80' : '#FCD34D' }]} />
          <Text style={styles.availText}>
            {user.availability === 'available' ? 'Available to Donate' : user.availability === 'resting' ? 'Resting — Not Available' : 'Busy — Not Available'}
          </Text>
          <AppSwitch
            value={user.availability === 'available'}
            onValueChange={(v) => actions.setAvailability(v ? 'available' : 'busy')}
            accessibilityLabel="Available to donate"
          />
        </View>
      </LinearGradient>

      {/* Stat tiles */}
      <View style={styles.tiles}>
        <Pressable style={{ flex: 1 }} onPress={() => router.push('/profile/donations')} accessibilityLabel="My donations">
          <LinearGradient colors={[Gradients.primary[0], Gradients.primary[2]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bigTile}>
            <Text style={styles.bigTileValue}>{stats.donations}</Text>
            <Text style={styles.bigTileLabel}>My{'\n'}Donations</Text>
          </LinearGradient>
        </Pressable>
        <View style={{ flex: 1, gap: 12 }}>
          <Pressable style={[styles.smallTile, { backgroundColor: '#ECFDF5' }]} onPress={() => router.navigate('/(tabs)/requests')} accessibilityLabel="Accepted requests">
            <Text style={[styles.smallValue, { color: Colors.success }]}>{stats.accepted}</Text>
            <Text style={[styles.smallLabel, { color: Colors.successDark }]}>Accepted</Text>
          </Pressable>
          <Pressable style={[styles.smallTile, { backgroundColor: '#EFF6FF' }]} onPress={() => router.navigate('/(tabs)/requests')} accessibilityLabel="Blood requests">
            <Text style={[styles.smallValue, { color: Colors.info }]}>{stats.requests}</Text>
            <Text style={[styles.smallLabel, { color: Colors.infoDark }]}>Requests</Text>
          </Pressable>
        </View>
      </View>

      {/* Donation history */}
      <Card style={{ gap: 18 }}>
        <SectionHeader
          title="Donation History"
          icon={<IconTile color={Colors.primary} bg={Colors.primarySoft} size={46} radius={14}><PulseIcon /></IconTile>}
          action="View All"
          onAction={() => router.push('/profile/donations')}
        />
        {eligible ? (
          <View style={styles.eligible}>
            <IconTile color={Colors.success} bg="#D1FAE5" size={42} radius={12}>
              <CircleCheck size={22} color={Colors.white} fill={Colors.success} />
            </IconTile>
            <Text style={styles.eligibleText}>You are eligible to donate right now</Text>
          </View>
        ) : (
          <View style={[styles.eligible, styles.notEligible]}>
            <IconTile color={Colors.warning} bg="#FEF3C7" size={42} radius={12}>
              <Clock size={20} color={Colors.warningDark} />
            </IconTile>
            <Text style={[styles.eligibleText, { color: '#92400E' }]}>
              Next eligible on {formatMonthDayYear(nextEligible)} ({daysUntil(parseDate(nextEligible))} days)
            </Text>
          </View>
        )}
        <DonationTimeline donations={recentDonations} />
      </Card>

      {/* Emergency request */}
      <Pressable onPress={() => router.push({ pathname: '/requests/new', params: { urgency: 'critical' } })} accessibilityRole="button" accessibilityLabel="Post emergency request">
        <LinearGradient colors={[Gradients.emergency[0], Gradients.emergency[1], Gradients.emergency[2]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.emergency}>
          <View style={styles.emergencyIcon}>
            <Zap size={28} color={Colors.white} fill={Colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.emergencyTitle}>Post Emergency Request</Text>
            <Text style={styles.emergencySub}>Notify all donors in your area instantly</Text>
          </View>
          <View style={styles.emergencyChevron}>
            <ChevronRight size={20} color={Colors.white} />
          </View>
        </LinearGradient>
      </Pressable>

      {/* Quick actions */}
      <View style={styles.quick}>
        <QuickAction label="Find Donors" bg={Colors.infoSoft} onPress={() => router.navigate('/(tabs)/donors')}>
          <Users size={26} color={Colors.info} fill={Colors.info} />
        </QuickAction>
        <QuickAction label="Hospitals" bg={Colors.successSoft} onPress={() => router.navigate('/(tabs)/hospitals')}>
          <MedicalIcon size={26} color={Colors.success} />
        </QuickAction>
        <QuickAction label="Alerts" bg={Colors.warningSoft} onPress={() => router.push('/notifications')}>
          <Bell size={26} color={Colors.warning} fill={Colors.warning} />
        </QuickAction>
        <QuickAction label="AI Help" bg={Colors.purpleSoft} onPress={() => router.push('/assistant')}>
          <MessageCircleMore size={28} color={Colors.white} fill={Colors.purpleDark} />
        </QuickAction>
      </View>

      {/* Requests near you */}
      <Card style={{ paddingBottom: 6 }}>
        <SectionHeader
          title="Requests Near You"
          icon={<IconTile icon={MapPin} color={Colors.danger} bg={Colors.primarySoft} size={46} radius={14} iconSize={20} />}
          badge={
            stats.urgent > 0 ? (
              <View style={styles.urgentPill}>
                <Text style={styles.urgentPillText}>{stats.urgent} urgent</Text>
              </View>
            ) : undefined
          }
          action="See All"
          onAction={() => router.navigate('/(tabs)/requests')}
          style={{ marginBottom: 6 }}
        />
        {nearby.length === 0 ? (
          <Text style={styles.emptyText}>No active requests within {state.settings.searchRadiusKm} km. Increase your search radius in Settings.</Text>
        ) : (
          nearby.map((r, i) => (
            <NearbyRequestRow
              key={r.id}
              request={r}
              last={i === nearby.length - 1}
              helped={hasResponded(r.id)}
              onPress={() => router.push(`/requests/${r.id}`)}
              onHelp={() => respond(r)}
            />
          ))
        )}
      </Card>

      {/* Recent activity */}
      <Card style={{ paddingBottom: 6 }}>
        <SectionHeader
          title="Recent Activity"
          icon={<IconTile color={Colors.info} bg={Colors.infoSoft} size={46} radius={14}><Bell size={20} color={Colors.info} fill={Colors.info} /></IconTile>}
          action="See All"
          onAction={() => router.push('/notifications')}
          style={{ marginBottom: 6 }}
        />
        {activity.length === 0 ? (
          <Text style={styles.emptyText}>No recent activity yet.</Text>
        ) : (
          activity.map((n, i) => (
            <ActivityRow
              key={n.id}
              item={n}
              compact
              last={i === activity.length - 1}
              onPress={() => {
                actions.markNotificationRead(n.id);
                router.push((n.link ?? '/notifications') as never);
              }}
            />
          ))
        )}
      </Card>
    </Screen>
  );
}

function QuickAction({ label, bg, onPress, children }: { label: string; bg: string; onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickItem, pressed && { opacity: 0.85 }]} accessibilityRole="button" accessibilityLabel={label}>
      <View style={[styles.quickIcon, { backgroundColor: bg }]}>{children}</View>
      <Text style={styles.quickLabel} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: SCREEN_PADDING, paddingTop: 10, paddingBottom: 14 },
  greeting: { fontSize: 14, color: Colors.textMuted },
  name: { fontSize: 22, fontWeight: '800', color: Colors.text, marginTop: 1 },
  bell: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft,
  },
  bellBadge: {
    position: 'absolute',
    top: 6,
    right: 7,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '800' },
  bloodCard: { borderRadius: 30, padding: 22, overflow: 'hidden', ...Shadows.primary },
  ring: { position: 'absolute', borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.13)' },
  bloodTop: { flexDirection: 'row', alignItems: 'flex-start' },
  bloodLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 2, color: 'rgba(255,255,255,0.75)', marginTop: 6 },
  bloodRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  bloodGroup: { fontSize: 52, fontWeight: '900', color: Colors.white, letterSpacing: -1 },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
  },
  verifiedText: { color: Colors.white, fontWeight: '600', fontSize: 13 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  location: { color: 'rgba(255,255,255,0.88)', fontSize: 15 },
  donationsCol: { alignItems: 'center', minWidth: 90 },
  dropCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donationsCount: { fontSize: 26, fontWeight: '800', color: Colors.white, marginTop: 10 },
  donationsLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 22,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  availDot: { width: 9, height: 9, borderRadius: 5 },
  availText: { flex: 1, color: Colors.white, fontWeight: '700', fontSize: 15 },
  tiles: { flexDirection: 'row', gap: 12 },
  bigTile: { flex: 1, borderRadius: 22, padding: 18, justifyContent: 'center', minHeight: 156, ...Shadows.primary },
  bigTileValue: { fontSize: 40, fontWeight: '900', color: Colors.white },
  bigTileLabel: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.88)', marginTop: 6, lineHeight: 20 },
  smallTile: { flex: 1, borderRadius: 20, paddingHorizontal: 16, justifyContent: 'center', minHeight: 72 },
  smallValue: { fontSize: 24, fontWeight: '900' },
  smallLabel: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  eligible: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: Colors.successBorder,
    borderRadius: 16,
    padding: 12,
  },
  notEligible: { backgroundColor: Colors.warningSoft, borderColor: Colors.warningBorder },
  eligibleText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#065F46' },
  emergency: { borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, ...Shadows.primary },
  emergencyIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTitle: { fontSize: 17, fontWeight: '800', color: Colors.white },
  emergencySub: { fontSize: 14, color: 'rgba(255,255,255,0.82)', marginTop: 3 },
  emergencyChevron: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quick: { flexDirection: 'row', gap: 10 },
  quickItem: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  quickIcon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  urgentPill: {
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  urgentPillText: { fontSize: 12, fontWeight: '700', color: Colors.danger },
  emptyText: { fontSize: 14, color: Colors.textMuted, paddingVertical: 16, lineHeight: 20 },
});
