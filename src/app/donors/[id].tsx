import { router, useLocalSearchParams } from 'expo-router';
import { BadgeCheck, CalendarDays, Clock, HeartHandshake, MapPin, Navigation, Phone, Share2, Star, User, UserX } from 'lucide-react-native';
import { Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { availabilityColor } from '@/components/cards/DonorCard';
import { Avatar } from '@/components/common/Avatar';
import { BloodBadge } from '@/components/common/BloodBadge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useFeedback } from '@/components/common/Feedback';
import { HeaderIconButton, StackHeader } from '@/components/common/Headers';
import { EmptyState, InfoRow, Pill } from '@/components/common/Misc';
import { Screen } from '@/components/common/Screen';
import { BloodDropIcon } from '@/components/icons';
import { Colors } from '@/constants/colors';
import { BloodGroupTones, CanDonateTo } from '@/constants/bloodGroups';
import { donors } from '@/data/donors';
import { formatMonthDayYear } from '@/utils/date';
import { availabilityLabel, formatDistance } from '@/utils/format';

export default function DonorDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { contact, toast } = useFeedback();
  const donor = donors.find((d) => d.id === id);

  if (!donor) {
    return (
      <Screen header={<StackHeader title="Donor Profile" />}>
        <EmptyState icon={UserX} title="Donor not found" message="This donor profile is no longer available." />
      </Screen>
    );
  }

  const share = async () => {
    try {
      await Share.share({ message: `${donor.name} (${donor.bloodGroup}) is a verified blood donor in ${donor.area}, ${donor.city} — found on LifeLink.` });
    } catch {
      toast('Sharing is not available', 'error');
    }
  };

  const footer = (
    <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
      <Button
        label="Contact"
        variant="outline"
        icon={<Phone size={18} color={Colors.primary} />}
        onPress={() => contact({ name: donor.name, phone: donor.phone, subtitle: `${donor.bloodGroup} donor · ${donor.area}` })}
        style={{ flex: 1 }}
      />
      <Button
        label="Request Blood"
        icon={<BloodDropIcon size={18} color={Colors.white} accent={Colors.primary} />}
        onPress={() => router.push({ pathname: '/requests/new', params: { bloodGroup: donor.bloodGroup } })}
        style={{ flex: 1.3 }}
      />
    </View>
  );

  return (
    <Screen
      header={
        <StackHeader
          title="Donor Profile"
          right={
            <HeaderIconButton label="Share donor" onPress={share}>
              <Share2 size={20} color={Colors.text} />
            </HeaderIconButton>
          }
        />
      }
      footer={footer}
      contentStyle={{ gap: 16 }}>
      <Card style={styles.hero}>
        <Avatar name={donor.name} size={96} />
        <View style={styles.nameRow}>
          <Text style={styles.name}>{donor.name}</Text>
          {donor.verified && <BadgeCheck size={22} color={Colors.white} fill={Colors.info} />}
        </View>
        <View style={styles.row}>
          <MapPin size={16} color={Colors.textMuted} />
          <Text style={styles.meta}>
            {donor.area}, {donor.city}
          </Text>
        </View>
        <View style={styles.badges}>
          <BloodBadge group={donor.bloodGroup} size="sm" />
          <Pill
            label={availabilityLabel[donor.availability]}
            color={availabilityColor[donor.availability]}
            bg={`${availabilityColor[donor.availability]}1A`}
            icon={<View style={[styles.dot, { backgroundColor: availabilityColor[donor.availability] }]} />}
            style={{ height: 34, borderRadius: 12, paddingHorizontal: 12 }}
          />
        </View>

        <View style={styles.stats}>
          <Stat icon={<BloodDropIcon size={18} color={Colors.primary} accent={Colors.primary} />} value={String(donor.donations)} label="Donations" />
          <Stat icon={<Star size={18} color={Colors.warning} fill={Colors.warning} />} value={donor.rating.toFixed(1)} label={`${donor.reviews} reviews`} />
          <Stat icon={<Navigation size={18} color={Colors.info} />} value={formatDistance(donor.distanceKm)} label="Away" />
        </View>
      </Card>

      <Card style={{ gap: 10 }}>
        <Text style={styles.cardTitle}>About</Text>
        <Text style={styles.about}>{donor.about}</Text>
      </Card>

      <Card style={{ gap: 12 }}>
        <Text style={styles.cardTitle}>Can donate to</Text>
        <View style={styles.compat}>
          {CanDonateTo[donor.bloodGroup].map((g) => (
            <View key={g} style={[styles.compatChip, { backgroundColor: BloodGroupTones[g].bg, borderColor: BloodGroupTones[g].border }]}>
              <Text style={[styles.compatText, { color: BloodGroupTones[g].text }]}>{g}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card style={{ paddingVertical: 6 }}>
        <InfoRow icon={Clock} iconColor={Colors.info} iconBg={Colors.infoSoft} label="Available Hours" value={donor.hours} />
        <InfoRow icon={CalendarDays} iconColor={Colors.primary} iconBg={Colors.primarySoft} label="Last Donation" value={formatMonthDayYear(donor.lastDonation)} />
        <InfoRow icon={User} iconColor={Colors.purple} iconBg={Colors.purpleSoft} label="Age & Gender" value={`${donor.age} years · ${donor.gender}`} />
        <InfoRow icon={HeartHandshake} iconColor={Colors.success} iconBg={Colors.successSoft} label="Member Since" value={formatMonthDayYear(donor.memberSince)} last />
      </Card>
    </Screen>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <View style={styles.stat}>
      {icon}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 8, paddingTop: 24 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  name: { fontSize: 22, fontWeight: '800', color: Colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { fontSize: 15, color: Colors.textMuted },
  badges: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  stats: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    marginTop: 14,
    paddingTop: 16,
  },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.text, marginTop: 4 },
  statLabel: { fontSize: 12, color: Colors.textMuted },
  cardTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  about: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  compat: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  compatChip: { paddingHorizontal: 14, height: 36, borderRadius: 12, borderWidth: 1.5, justifyContent: 'center' },
  compatText: { fontWeight: '800', fontSize: 15 },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
});
