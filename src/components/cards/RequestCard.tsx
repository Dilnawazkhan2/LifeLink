import { CircleAlert, CircleCheck, MapPin, Phone, Users } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BloodBadge } from '@/components/common/BloodBadge';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/theme';
import type { BloodRequest, Urgency } from '@/types';
import { timeAgo } from '@/utils/date';
import { place } from '@/utils/format';

export const urgencyStyle: Record<Urgency, { label: string; color: string; bg: string }> = {
  critical: { label: 'CRITICAL', color: Colors.white, bg: '#EF4444' },
  urgent: { label: 'URGENT', color: Colors.white, bg: '#F43F0B' },
  normal: { label: 'NORMAL', color: Colors.infoDark, bg: Colors.infoSoft },
};

const borderColor: Record<Urgency, string> = {
  critical: '#EF4444',
  urgent: '#F97316',
  normal: '#60A5FA',
};

interface Props {
  request: BloodRequest;
  onPress: () => void;
  onContact: () => void;
  responded?: boolean;
}

export function RequestCard({ request, onPress, onContact, responded }: Props) {
  const u = urgencyStyle[request.urgency];
  const fulfilled = request.status === 'fulfilled';
  return (
    <View style={[styles.card, { borderLeftColor: fulfilled ? '#CBD5E1' : borderColor[request.urgency] }]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Blood request for ${request.patientName}`}
        style={({ pressed }) => [styles.main, pressed && { opacity: 0.85 }]}>
      <View style={styles.headRow}>
        <View style={[styles.tag, { backgroundColor: fulfilled ? Colors.successSoft : u.bg }]}>
          {fulfilled ? (
            <CircleCheck size={15} color={Colors.successDark} />
          ) : request.urgency === 'urgent' ? (
            <Text style={[styles.bang, { color: u.color }]}>!</Text>
          ) : (
            <CircleAlert size={15} color={u.color} fill={request.urgency === 'critical' ? 'rgba(255,255,255,0.35)' : 'transparent'} />
          )}
          <Text style={[styles.tagText, { color: fulfilled ? Colors.successDark : u.color }]}>
            {fulfilled ? 'FULFILLED' : u.label}
          </Text>
        </View>
        <Text style={styles.time}>{timeAgo(request.createdAt)}</Text>
      </View>

      <View style={styles.body}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={styles.patient} numberOfLines={1}>
            {request.patientName}
          </Text>
          <View style={styles.row}>
            <MapPin size={16} color={Colors.textMuted} />
            <Text style={styles.hospital} numberOfLines={1}>
              {request.hospitalName}
            </Text>
          </View>
          <Text style={styles.area}>
            {place(request.area, request.city)}
          </Text>
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <BloodBadge group={request.bloodGroup} size="card" />
          <Text style={styles.units}>
            {request.units} unit{request.units > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <Text style={styles.desc} numberOfLines={2}>
        {request.description}
      </Text>
      </Pressable>

      <View style={styles.footer}>
        <Pressable onPress={onContact} hitSlop={8} style={[styles.row, { flex: 1 }]} accessibilityRole="button" accessibilityLabel={`Contact ${request.contactName}`}>
          <Phone size={17} color={Colors.textMuted} strokeWidth={1.8} />
          <Text style={styles.contact} numberOfLines={1}>
            {request.contactName}
          </Text>
        </Pressable>
        {request.respondedCount > 0 && (
          <View style={styles.responded}>
            <Users size={14} color={Colors.success} fill={Colors.success} />
            <Text style={styles.respondedText}>{request.respondedCount} responded</Text>
          </View>
        )}
        {responded ? (
          <Text style={[styles.status, { color: Colors.successDark }]}>✓ You</Text>
        ) : fulfilled ? (
          <Text style={[styles.status, { color: Colors.textMuted }]}>Closed</Text>
        ) : request.status === 'pending' ? (
          <Text style={[styles.status, { color: Colors.warning }]}>In review</Text>
        ) : request.status === 'rejected' || request.status === 'cancelled' ? (
          <Text style={[styles.status, { color: Colors.textMuted }]}>Not approved</Text>
        ) : (
          <View style={styles.row}>
            <View style={[styles.statusDot, { backgroundColor: request.urgency === 'normal' ? Colors.success : Colors.danger }]} />
            <Text style={[styles.status, { color: request.urgency === 'normal' ? Colors.successDark : Colors.danger }]}>
              {request.urgency === 'normal' ? 'Active' : 'Urgent'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    paddingLeft: 18,
    gap: 12,
    ...Shadows.card,
  },
  main: { gap: 12 },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, height: 30, borderRadius: 8 },
  bang: { fontSize: 15, fontWeight: '900' },
  tagText: { fontSize: 14, fontWeight: '800', letterSpacing: 0.8 },
  time: { fontSize: 14, color: Colors.textMuted },
  body: { flexDirection: 'row', gap: 12 },
  patient: { fontSize: 19, fontWeight: '800', color: Colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hospital: { fontSize: 15, color: Colors.textSecondary, flexShrink: 1 },
  area: { fontSize: 14, color: Colors.textMuted },
  units: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  desc: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  contact: { fontSize: 15, color: Colors.textMuted, flexShrink: 1 },
  responded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.successSoft,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
  },
  respondedText: { fontSize: 13, fontWeight: '700', color: Colors.success },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  status: { fontSize: 15, fontWeight: '600' },
});
