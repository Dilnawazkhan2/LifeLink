import {
  Award,
  Bell,
  CircleCheck,
  HeartPulse,
  Info,
  MapPin,
  MessageSquareText,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BloodDropIcon } from '@/components/icons';
import { Colors } from '@/constants/colors';
import { BloodGroupTones } from '@/constants/bloodGroups';
import type { AppNotification, BloodRequest, Donation, NotificationType } from '@/types';
import { formatDayMonthYear, formatMonthDayYear, timeAgo } from '@/utils/date';
import { formatDistanceAway } from '@/utils/format';

/* ----------------------------- NearbyRequestRow ---------------------------- */

export function NearbyRequestRow({
  request,
  onPress,
  onHelp,
  helped,
  last,
}: {
  request: BloodRequest;
  onPress: () => void;
  onHelp: () => void;
  helped: boolean;
  last?: boolean;
}) {
  const tone = BloodGroupTones[request.bloodGroup];
  const urgent = request.urgency !== 'normal';
  return (
    <View style={[styles.nearby, !last && styles.border]}>
      <Pressable onPress={onPress} style={styles.nearbyMain} accessibilityRole="button" accessibilityLabel={`View request for ${request.patientName}`}>
      <View style={[styles.groupTile, { backgroundColor: tone.bg, borderColor: tone.border }]}>
        <Text style={[styles.groupText, { color: tone.text }]}>{request.bloodGroup}</Text>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <View style={styles.row}>
          <Text style={styles.nearbyName} numberOfLines={1}>
            {request.patientName}
          </Text>
          {urgent && (
            <View style={styles.urgentTag}>
              <View style={styles.urgentDot} />
              <Text style={styles.urgentText}>URGENT</Text>
            </View>
          )}
        </View>
        <Text style={styles.nearbyHospital} numberOfLines={1}>
          {request.hospitalName}
        </Text>
        <View style={styles.row}>
          <MapPin size={15} color={Colors.textMuted} />
          <Text style={styles.nearbyMeta}>{formatDistanceAway(request.distanceKm)}</Text>
          <Text style={styles.nearbyMeta}>·</Text>
          <BloodDropIcon size={14} variant="outline" color={Colors.textMuted} strokeWidth={1.8} />
          <Text style={styles.nearbyMeta}>{request.units} units</Text>
        </View>
      </View>
      </Pressable>
      <Pressable
        onPress={onHelp}
        disabled={helped}
        accessibilityRole="button"
        accessibilityLabel={helped ? 'Already responded' : `Help ${request.patientName}`}
        style={({ pressed }) => [styles.help, helped && styles.helped, pressed && { opacity: 0.85 }]}>
        <Text style={[styles.helpText, helped && { color: Colors.successDark }]}>{helped ? '✓' : 'Help'}</Text>
      </Pressable>
    </View>
  );
}

/* ------------------------------ ActivityRow ------------------------------- */

const notificationIcon: Record<NotificationType, { icon: LucideIcon | 'drop'; color: string; bg: string }> = {
  request: { icon: 'drop', color: Colors.danger, bg: Colors.primarySoft },
  accepted: { icon: Info, color: Colors.info, bg: Colors.infoSoft },
  message: { icon: Info, color: Colors.info, bg: Colors.infoSoft },
  donation: { icon: CircleCheck, color: Colors.success, bg: Colors.successSoft },
  badge: { icon: Award, color: Colors.warning, bg: Colors.warningSoft },
  system: { icon: Bell, color: Colors.purple, bg: Colors.purpleSoft },
};

export const NotificationIcon = ({ type, size = 52 }: { type: NotificationType; size?: number }) => {
  const cfg = notificationIcon[type];
  const Icon = cfg.icon;
  return (
    <View style={[styles.activityIcon, { width: size, height: size, backgroundColor: cfg.bg }]}>
      {Icon === 'drop' ? (
        <BloodDropIcon size={20} color={cfg.color} accent={cfg.bg} />
      ) : type === 'message' ? (
        <MessageSquareText size={20} color={cfg.color} />
      ) : (
        <Icon size={20} color={Colors.white} fill={cfg.color} />
      )}
    </View>
  );
};

export function ActivityRow({
  item,
  onPress,
  last,
  compact,
}: {
  item: AppNotification;
  onPress: () => void;
  last?: boolean;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.activity, !last && styles.border, pressed && { opacity: 0.75 }]}
      accessibilityRole="button">
      <NotificationIcon type={item.type} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={[styles.activityTitle, !item.read && { fontWeight: '700' }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.activityBody} numberOfLines={compact ? 1 : 2}>
          {item.body}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 10, alignSelf: compact ? 'center' : 'flex-start' }}>
        <Text style={styles.activityTime}>{timeAgo(item.createdAt)}</Text>
        {!item.read && <View style={styles.unreadDot} />}
      </View>
    </Pressable>
  );
}

/* ---------------------------- DonationTimeline ---------------------------- */

export function DonationTimeline({ donations }: { donations: Donation[] }) {
  return (
    <View>
      {donations.map((d, i) => (
        <View key={d.id} style={styles.tlItem}>
          <View style={styles.tlRail}>
            <View style={[styles.tlDot, i === 0 && styles.tlDotActive]} />
            {i < donations.length - 1 && <View style={styles.tlLine} />}
          </View>
          <View style={{ flex: 1, paddingBottom: i < donations.length - 1 ? 22 : 0, gap: 6 }}>
            <Text style={styles.tlDate}>{formatDayMonthYear(d.date)}</Text>
            <Text style={styles.tlHospital}>{d.hospitalName}</Text>
            <View style={styles.row}>
              <View style={styles.unitPill}>
                <BloodDropIcon size={13} color={Colors.primary} accent="#FFE4E6" />
                <Text style={styles.unitText}>
                  {d.units} unit{d.units > 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.groupPill}>
                <Text style={styles.groupPillText}>{d.bloodGroup}</Text>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

/* ----------------------------- RecentDonationRow -------------------------- */

export function RecentDonationRow({ donation, last, onPress }: { donation: Donation; last?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[styles.recent, !last && styles.border]}>
      <View style={styles.recentIcon}>
        <BloodDropIcon size={18} color={Colors.white} accent={Colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={styles.recentTitle} numberOfLines={1}>
          {donation.hospitalName}
        </Text>
        <Text style={styles.recentDate}>{formatMonthDayYear(donation.date)}</Text>
      </View>
      <View style={styles.recentUnits}>
        <Text style={styles.recentUnitsText}>
          {donation.units} unit{donation.units > 1 ? 's' : ''}
        </Text>
      </View>
    </Pressable>
  );
}

export const PulseIcon = () => <HeartPulse size={20} color={Colors.primary} />;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  border: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  nearby: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16 },
  nearbyMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  groupTile: { width: 64, height: 64, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  groupText: { fontSize: 18, fontWeight: '800' },
  nearbyName: { fontSize: 17, fontWeight: '700', color: Colors.text, flexShrink: 1 },
  urgentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 7,
    height: 22,
    borderRadius: 6,
  },
  urgentDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },
  urgentText: { fontSize: 11, fontWeight: '800', color: '#EF4444', letterSpacing: 0.8 },
  nearbyHospital: { fontSize: 15, color: Colors.textMuted },
  nearbyMeta: { fontSize: 14, color: Colors.textMuted },
  help: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 13,
    justifyContent: 'center',
    minWidth: 66,
    alignItems: 'center',
  },
  helped: { backgroundColor: Colors.successSoft, borderWidth: 1, borderColor: Colors.successBorder },
  helpText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  activity: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  activityIcon: { borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  activityTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  activityBody: { fontSize: 14, color: Colors.textMuted, lineHeight: 20 },
  activityTime: { fontSize: 13, color: Colors.textMuted },
  unreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.primary },
  tlItem: { flexDirection: 'row', gap: 16 },
  tlRail: { width: 14, alignItems: 'center' },
  tlDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#E2E8F0', marginTop: 4 },
  tlDotActive: { backgroundColor: Colors.primary, width: 14, height: 14, borderRadius: 7 },
  tlLine: { flex: 1, width: 2, backgroundColor: '#EEF0F4', marginTop: 4 },
  tlDate: { fontSize: 14, color: Colors.textMuted },
  tlHospital: { fontSize: 17, fontWeight: '600', color: Colors.text },
  unitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 8,
  },
  unitText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  groupPill: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, height: 28, borderRadius: 8, justifyContent: 'center' },
  groupPillText: { fontSize: 14, color: Colors.textMuted, fontWeight: '600' },
  recent: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  recentIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  recentDate: { fontSize: 14, color: Colors.textMuted },
  recentUnits: { backgroundColor: Colors.primarySoft, paddingHorizontal: 14, height: 34, borderRadius: 12, justifyContent: 'center' },
  recentUnitsText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
});
