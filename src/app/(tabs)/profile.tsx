import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  ArrowRight,
  Award,
  Bell,
  CalendarDays,
  Camera,
  CircleCheck,
  CircleX,
  Clock,
  Heart,
  Info,
  LogOut,
  Mail,
  MapPin,
  MessageCircleMore,
  Pencil,
  Phone,
  Settings,
  Timer,
  User,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BadgeCard } from '@/components/cards/BadgeCard';
import { RecentDonationRow } from '@/components/cards/ListItems';
import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/common/Card';
import { useFeedback } from '@/components/common/Feedback';
import { HeaderIconButton, PageHeader } from '@/components/common/Headers';
import { InfoRow, ListRow, SectionHeader } from '@/components/common/Misc';
import { Screen } from '@/components/common/Screen';
import { BloodDropIcon } from '@/components/icons';
import { Colors, Gradients } from '@/constants/colors';
import { BloodGroupTones } from '@/constants/bloodGroups';
import { SCREEN_PADDING, Shadows } from '@/constants/theme';
import { useApp, useEligibility, useStats } from '@/store/AppStore';
import type { Availability } from '@/types';
import { formatMonthDayYear, parseDate } from '@/utils/date';
import { roleLabel, place } from '@/utils/format';

const AVAILABILITY: { key: Availability; label: string; icon: typeof CircleCheck; color: string; bg: string; border: string }[] = [
  { key: 'available', label: 'Available', icon: CircleCheck, color: Colors.success, bg: Colors.successSoft, border: '#86EFAC' },
  { key: 'resting', label: 'Resting', icon: Clock, color: Colors.warningDark, bg: Colors.warningSoft, border: Colors.warningBorder },
  { key: 'busy', label: 'Busy', icon: CircleX, color: Colors.danger, bg: Colors.dangerSoft, border: Colors.dangerBorder },
];

export default function Profile() {
  const { state, actions } = useApp();
  const stats = useStats();
  const { eligible, lastDonation, nextEligible } = useEligibility();
  const { confirm, toast } = useFeedback();
  const { user } = state;
  const recent = [...state.donations].sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime()).slice(0, 3);
  const earned = state.badges.filter((b) => b.earnedAt);

  const pickPhoto = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        toast('Photo library permission is required', 'error');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) {
        if (await actions.updateUser({ avatarUri: result.assets[0].uri })) toast('Profile photo updated');
      }
    } catch {
      toast('Could not open photo library', 'error');
    }
  };

  const signOut = () =>
    confirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out? Your local data will stay on this device.',
      confirmLabel: 'Sign Out',
      destructive: true,
      icon: LogOut,
      onConfirm: async () => {
        await actions.logout();
        router.replace('/login');
      },
    });

  const header = (
    <PageHeader
      title="Profile"
      subtitle="Your donor account"
      bordered
      right={
        <HeaderIconButton tone="grey" label="Settings" onPress={() => router.push('/settings')}>
          <Settings size={26} color={Colors.text} strokeWidth={1.7} />
        </HeaderIconButton>
      }
    />
  );

  return (
    <Screen header={header} withTabBar contentStyle={{ gap: 16, paddingTop: 16, paddingHorizontal: 14 }}>
      {/* Hero */}
      <LinearGradient colors={[Gradients.primary[0], Gradients.primary[1], Gradients.primary[2]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={[styles.ring, { width: 260, height: 260, top: -60, right: -80 }]} />
        <View style={[styles.ring, { width: 200, height: 200, bottom: -90, left: -110 }]} />

        <View style={styles.heroTop}>
          <View>
            <View style={styles.avatarRing}>
              <Avatar name={user.name} uri={user.avatarUri} size={86} tone={{ bg: '#FCE7F3', text: '#E11D74' }} />
            </View>
            <Pressable onPress={pickPhoto} style={styles.cameraBadge} accessibilityLabel="Change profile photo">
              <Camera size={15} color={Colors.primary} fill={Colors.primary} stroke={Colors.white} />
            </Pressable>
          </View>
          <View style={{ flex: 1, gap: 8 }}>
            <View style={styles.nameRow}>
              <Text style={styles.heroName} numberOfLines={1}>
                {user.name}
              </Text>
              {user.verified && <CircleCheck size={20} color={Colors.primary} fill="rgba(255,255,255,0.85)" />}
            </View>
            <Text style={styles.heroEmail} numberOfLines={1}>
              {user.email}
            </Text>
            <View style={styles.groupPill}>
              <BloodDropIcon size={14} color={Colors.primary} accent={Colors.white} />
              <Text style={[styles.groupPillText, { color: BloodGroupTones[user.bloodGroup].text }]}>{user.bloodGroupMissing ? '—' : user.bloodGroup}</Text>
            </View>
            <View style={styles.rolePill}>
              <Text style={styles.roleText}>{roleLabel(user.role)}</Text>
            </View>
            <View style={styles.locRow}>
              <MapPin size={15} color="rgba(255,255,255,0.85)" />
              <Text style={styles.heroLoc} numberOfLines={1}>
                {place(user.area, user.city)}
              </Text>
            </View>
          </View>
          <Pressable onPress={() => router.push('/profile/edit')} style={styles.editBtn} accessibilityLabel="Edit profile">
            <Pencil size={18} color={Colors.primary} />
          </Pressable>
        </View>

        <View style={[styles.readyPill, !eligible && { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
          {eligible ? <CircleCheck size={18} color={Colors.white} fill={Colors.success} /> : <Timer size={18} color={Colors.warningDark} />}
          <Text style={[styles.readyText, !eligible && { color: '#92400E' }]}>
            {eligible ? 'Ready to donate' : `Eligible ${formatMonthDayYear(nextEligible)}`}
          </Text>
        </View>

        <View style={styles.heroDivider} />
        <View style={styles.heroStats}>
          <HeroStat value={String(stats.donations)} label="Donations" onPress={() => router.push('/profile/donations')} />
          <View style={styles.heroSep} />
          <HeroStat value={String(stats.livesSaved)} label="Lives Saved" />
          <View style={styles.heroSep} />
          <HeroStat value={stats.rating.toFixed(1)} label="Rating" />
          <View style={styles.heroSep} />
          <HeroStat value={String(stats.badges)} label="Badges" onPress={() => router.push('/profile/badges')} />
        </View>
      </LinearGradient>

      {/* Ready to save a life */}
      {eligible ? (
        <View style={styles.saveCard}>
          <LinearGradient colors={['#10B981', '#047857']} style={styles.saveIcon}>
            <Heart size={26} color={Colors.white} fill={Colors.white} />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.saveTitle}>Ready to Save a Life!</Text>
            <Text style={styles.saveSub} numberOfLines={2}>
              You&apos;re eligible to donate blood today
            </Text>
          </View>
          <Pressable onPress={() => router.navigate('/(tabs)/requests')} style={styles.donateBtn} accessibilityRole="button">
            <Text style={styles.donateText}>Donate</Text>
            <ArrowRight size={18} color={Colors.white} />
          </Pressable>
        </View>
      ) : (
        <View style={[styles.saveCard, { backgroundColor: Colors.warningSoft, borderColor: Colors.warningBorder }]}>
          <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.saveIcon}>
            <Timer size={26} color={Colors.white} />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={[styles.saveTitle, { color: '#92400E' }]}>Recovery Period</Text>
            <Text style={[styles.saveSub, { color: '#B45309' }]}>Next eligible on {formatMonthDayYear(nextEligible)}</Text>
          </View>
        </View>
      )}

      {/* Availability */}
      <Card style={{ gap: 16 }}>
        <Text style={styles.cardTitle}>Availability Status</Text>
        <View style={styles.availRow}>
          {AVAILABILITY.map((a) => {
            const active = user.availability === a.key;
            const Icon = a.icon;
            return (
              <Pressable
                key={a.key}
                onPress={() => {
                  actions.setAvailability(a.key);
                  toast(`Status set to ${a.label}`);
                }}
                style={[styles.availOption, active && { backgroundColor: a.bg, borderColor: a.border }]}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                accessibilityLabel={a.label}>
                <Icon size={30} color={Colors.white} fill={active ? a.color : Colors.textMuted} />
                <Text style={[styles.availLabel, active && { color: a.color, fontWeight: '700' }]}>{a.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.hintRow}>
          <Info size={16} color={Colors.textMuted} />
          <Text style={styles.hint}>Nearby donors see your status when searching</Text>
        </View>
      </Card>

      {/* Personal details */}
      <Card style={{ paddingBottom: 6 }}>
        <SectionHeader
          title="Personal Details"
          badge={undefined}
          style={{ marginBottom: 8 }}
        />
        <Pressable onPress={() => router.push('/profile/edit')} style={styles.editPill} accessibilityRole="button" accessibilityLabel="Edit personal details">
          <Pencil size={17} color={Colors.primary} />
          <Text style={styles.editPillText}>Edit</Text>
        </Pressable>
        <InfoRow icon={Mail} iconColor={Colors.info} iconBg={Colors.infoSoft} label="Email Address" value={user.email} />
        <InfoRow icon={Phone} iconColor={Colors.success} iconBg={Colors.successSoft} label="Phone Number" value={user.phone} />
        <InfoRow icon={BloodIconAdapter} iconColor={Colors.primary} iconBg={Colors.primarySoft} label="Blood Group" value={user.bloodGroupMissing ? 'Not set' : user.bloodGroup} />
        <InfoRow icon={MapPin} iconColor={Colors.warning} iconBg={Colors.warningSoft} label="City & Area" value={place(user.area, user.city)} />
        <InfoRow icon={User} iconColor={Colors.purple} iconBg={Colors.purpleSoft} label="Account Role" value={roleLabel(user.role)} />
        <InfoRow
          icon={CalendarDays}
          iconColor={Colors.primary}
          iconBg={Colors.primarySoft}
          label="Last Donation"
          value={lastDonation ? formatMonthDayYear(lastDonation) : 'No donations yet'}
        />
        <InfoRow icon={Timer} iconColor={Colors.success} iconBg={Colors.successSoft} label="Next Eligible Date" value={formatMonthDayYear(nextEligible)} last />
      </Card>

      {/* Badges */}
      <Card style={{ gap: 16 }}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Badges Earned</Text>
          <Pressable onPress={() => router.push('/profile/badges')} style={styles.softBtn} accessibilityRole="button" accessibilityLabel="View all badges">
            <Text style={styles.softBtnText}>{earned.length} earned</Text>
          </Pressable>
        </View>
        <View style={styles.badgeRow}>
          {earned.slice(0, 2).map((b) => (
            <Pressable key={b.id} style={{ flex: 1 }} onPress={() => router.push('/profile/badges')} accessibilityLabel={`${b.title} badge`}>
              <BadgeCard badge={b} style={{ width: '100%' }} />
            </Pressable>
          ))}
        </View>
      </Card>

      {/* Recent donations */}
      <Card style={{ paddingBottom: 6 }}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Recent Donations</Text>
          <Pressable onPress={() => router.push('/profile/donations')} style={styles.softBtn} accessibilityRole="button">
            <Text style={styles.softBtnText}>View All</Text>
          </Pressable>
        </View>
        {recent.map((d, i) => (
          <RecentDonationRow key={d.id} donation={d} last={i === recent.length - 1} />
        ))}
      </Card>

      {/* Account */}
      <Card style={{ paddingBottom: 6 }}>
        <Text style={[styles.cardTitle, { marginBottom: 6 }]}>Account</Text>
        <ListRow icon={Award} iconColor={Colors.primary} iconBg={Colors.primarySoft} title="Donation History" subtitle="View your past donations" onPress={() => router.push('/profile/donations')} />
        <ListRow icon={User} iconColor={Colors.info} iconBg={Colors.infoSoft} title="Edit Profile" subtitle="Update your information" onPress={() => router.push('/profile/edit')} />
        <ListRow
          icon={Bell}
          iconColor={Colors.warning}
          iconBg={Colors.warningSoft}
          title="Notifications"
          subtitle={stats.unread > 0 ? `${stats.unread} unread` : 'All caught up'}
          onPress={() => router.push('/notifications')}
          right={
            stats.unread > 0 ? (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{stats.unread}</Text>
              </View>
            ) : undefined
          }
        />
        <ListRow icon={MessageCircleMore} iconColor={Colors.purple} iconBg={Colors.purpleSoft} title="AI Assistant" subtitle="Ask donation questions" onPress={() => router.push('/assistant')} />
        <ListRow icon={Settings} iconColor={Colors.textSecondary} iconBg="#F1F5F9" title="Settings" subtitle="App preferences" onPress={() => router.push('/settings')} />
        <ListRow icon={Info} iconColor={Colors.textMuted} iconBg="#F8FAFC" title="About LifeLink" subtitle="Version 1.0.0" onPress={() => router.push('/about')} last />
      </Card>

      <Pressable onPress={signOut} style={({ pressed }) => [styles.signOut, pressed && { opacity: 0.85 }]} accessibilityRole="button">
        <View style={styles.signOutIcon}>
          <LogOut size={22} color={Colors.danger} />
        </View>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </Screen>
  );
}

/** Lucide-compatible wrapper so the blood drop can be used in InfoRow. */
function BloodIconAdapter({ color, size }: { color?: string; size?: number | string }) {
  return <BloodDropIcon size={Number(size ?? 22)} color={color ?? Colors.primary} accent={Colors.primarySoft} />;
}

function HeroStat({ value, label, onPress }: { value: string; label: string; onPress?: () => void }) {
  return (
    <Pressable style={styles.heroStat} onPress={onPress} disabled={!onPress} accessibilityLabel={`${value} ${label}`}>
      <Text style={styles.heroStatValue}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 32, padding: 20, overflow: 'hidden', ...Shadows.primary },
  ring: { position: 'absolute', borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.13)' },
  heroTop: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  avatarRing: {
    padding: 4,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: 4,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 4 },
  heroName: { fontSize: 20, fontWeight: '800', color: Colors.white, flexShrink: 1 },
  heroEmail: { fontSize: 14, color: 'rgba(255,255,255,0.78)' },
  groupPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 15,
  },
  groupPillText: { fontSize: 15, fontWeight: '800' },
  rolePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
  },
  roleText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroLoc: { color: 'rgba(255,255,255,0.88)', fontSize: 14, flexShrink: 1 },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft,
  },
  readyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 19,
    marginTop: 16,
  },
  readyText: { color: Colors.successDark, fontWeight: '700', fontSize: 15 },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.18)', marginTop: 18, marginBottom: 14 },
  heroStats: { flexDirection: 'row', alignItems: 'center' },
  heroStat: { flex: 1, alignItems: 'center', gap: 4 },
  heroStatValue: { fontSize: 24, fontWeight: '800', color: Colors.white },
  heroStatLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', letterSpacing: 0.3 },
  heroSep: { width: 1, height: 34, backgroundColor: 'rgba(255,255,255,0.22)' },
  saveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 24,
    backgroundColor: '#F0FDF6',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  saveIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  saveTitle: { fontSize: 16, fontWeight: '800', color: Colors.successDark },
  saveSub: { fontSize: 12.5, color: Colors.successDark, marginTop: 2 },
  donateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.success,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 14,
    ...Shadows.success,
  },
  donateText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
  cardTitle: { fontSize: 19, fontWeight: '800', color: Colors.text },
  availRow: { flexDirection: 'row', gap: 10 },
  availOption: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    backgroundColor: '#F8FAFC',
  },
  availLabel: { fontSize: 15, color: Colors.textMuted, fontWeight: '600' },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hint: { fontSize: 13, color: Colors.textMuted, flex: 1 },
  editPill: {
    position: 'absolute',
    top: 14,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 14,
  },
  editPillText: { color: Colors.primary, fontWeight: '700', fontSize: 16 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  badgeRow: { flexDirection: 'row', gap: 12 },
  softBtn: { backgroundColor: Colors.primarySoft, paddingHorizontal: 14, height: 38, borderRadius: 14, justifyContent: 'center' },
  softBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
  countBadge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#FFF5F5',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    marginHorizontal: SCREEN_PADDING - 14,
  },
  signOutIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: { fontSize: 18, fontWeight: '700', color: Colors.danger },
});
