import { router, useLocalSearchParams } from 'expo-router';
import {
  Building2,
  CircleCheck,
  ClipboardX,
  Clock,
  HeartHandshake,
  MapPin,
  Phone,
  Share2,
  Trash2,
  User,
  Users,
} from 'lucide-react-native';
import { Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { urgencyStyle } from '@/components/cards/RequestCard';
import { BloodBadge } from '@/components/common/BloodBadge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useFeedback } from '@/components/common/Feedback';
import { HeaderIconButton, StackHeader } from '@/components/common/Headers';
import { EmptyState, InfoRow, Pill } from '@/components/common/Misc';
import { Screen } from '@/components/common/Screen';
import { Colors } from '@/constants/colors';
import { CanDonateTo } from '@/constants/bloodGroups';
import { useRequestActions } from '@/hooks/useRequestActions';
import { useApp } from '@/store/AppStore';
import { formatMonthDayYear, formatTime, timeAgo } from '@/utils/date';
import { formatDistance, place } from '@/utils/format';

const GUIDELINES = [
  'Bring a valid ID (CNIC) to the hospital',
  'Drink plenty of water (500 ml+) beforehand',
  'Eat a healthy meal before donating',
  'Wear comfortable, loose-fitting clothing',
  'Rest for 15 minutes after donation',
];

export default function RequestDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { state, actions } = useApp();
  const { confirm, toast } = useFeedback();
  const { respond, contactRequester, hasResponded } = useRequestActions();
  const request = state.requests.find((r) => r.id === id);

  if (!request) {
    return (
      <Screen header={<StackHeader title="Request Details" />}>
        <EmptyState icon={ClipboardX} title="Request not found" message="This request may have been removed." />
      </Screen>
    );
  }

  const responded = hasResponded(request.id);
  const fulfilled = request.status === 'fulfilled';
  const pending = request.status === 'pending';
  const rejected = request.status === 'rejected';
  const live = state.mode === 'live';
  const u = urgencyStyle[request.urgency];
  const groupKnown = !state.user.bloodGroupMissing;
  const compatible = groupKnown && CanDonateTo[state.user.bloodGroup].includes(request.bloodGroup);
  const alreadyDonated = state.donations.some((d) => d.requestId === request.id);

  const share = async () => {
    try {
      await Share.share({
        message: `URGENT: ${request.units} unit(s) of ${request.bloodGroup} blood needed for ${request.patientName} at ${request.hospitalName}, ${request.city}. Contact ${request.contactName}: ${request.contactPhone} — shared via LifeLink`,
      });
    } catch {
      toast('Sharing is not available', 'error');
    }
  };

  const confirmDonation = () =>
    confirm({
      title: 'Confirm Donation',
      message: `Mark your donation at ${request.hospitalName} as completed? It will be added to your donation history.`,
      confirmLabel: 'Yes, I Donated',
      tone: 'success',
      icon: CircleCheck,
      onConfirm: async () => {
        if (await actions.recordDonation({ hospitalName: request.hospitalName, city: request.city, units: 1, requestId: request.id }))
          toast('Thank you! Donation added to your history.');
      },
    });

  const withdraw = () =>
    confirm({
      title: 'Withdraw Response?',
      message: 'The requester will be informed that you can no longer donate for this request.',
      confirmLabel: 'Withdraw',
      destructive: true,
      onConfirm: async () => {
        if (await actions.withdrawResponse(request.id)) toast('Response withdrawn', 'info');
      },
    });

  const markFulfilled = () =>
    confirm({
      title: 'Mark as Fulfilled?',
      message: 'Donors will stop being notified about this request.',
      confirmLabel: 'Mark Fulfilled',
      tone: 'success',
      icon: CircleCheck,
      onConfirm: async () => {
        if (await actions.markRequestFulfilled(request.id)) toast('Request marked as fulfilled');
      },
    });

  const remove = () =>
    confirm({
      title: live ? 'Cancel Request?' : 'Delete Request?',
      message: live
        ? 'Your request will be closed and donors who responded will be notified.'
        : 'This will permanently remove your blood request.',
      confirmLabel: live ? 'Cancel Request' : 'Delete',
      destructive: true,
      icon: Trash2,
      onConfirm: async () => {
        if (!(await actions.deleteRequest(request.id))) return;
        router.back();
        toast(live ? 'Request cancelled' : 'Request deleted', 'info');
      },
    });

  let footerContent: React.ReactNode;
  if (request.isMine && rejected) {
    footerContent = <Button label="This request was not approved" variant="soft" color={Colors.textMuted} disabled />;
  } else if (request.isMine && pending) {
    footerContent = <Button label="Cancel Request" variant="outline" color={Colors.danger} icon={<Trash2 size={18} color={Colors.danger} />} onPress={remove} />;
  } else if (request.isMine) {
    footerContent = fulfilled ? (
      <Button label="Delete Request" variant="outline" color={Colors.danger} icon={<Trash2 size={18} color={Colors.danger} />} onPress={remove} />
    ) : (
      <>
        <Button label={live ? 'Cancel' : 'Delete'} variant="outline" color={Colors.danger} onPress={remove} style={{ flex: 1 }} />
        <Button label="Mark Fulfilled" variant="solid" color={Colors.success} onPress={markFulfilled} style={{ flex: 1.6 }} />
      </>
    );
  } else if (fulfilled) {
    footerContent = <Button label="This request has been fulfilled" variant="soft" color={Colors.successDark} disabled />;
  } else if (responded) {
    footerContent = alreadyDonated ? (
      <Button label="Donation recorded — thank you!" variant="soft" color={Colors.successDark} icon={<CircleCheck size={18} color={Colors.successDark} />} disabled />
    ) : (
      <>
        <Button label="Withdraw" variant="outline" onPress={withdraw} style={{ flex: 1 }} />
        <Button label="I Donated" variant="solid" color={Colors.success} icon={<CircleCheck size={18} color={Colors.white} />} onPress={confirmDonation} style={{ flex: 1.6 }} />
      </>
    );
  } else {
    footerContent = (
      <>
        <Button label="Contact" variant="outline" icon={<Phone size={18} color={Colors.primary} />} onPress={() => contactRequester(request)} style={{ flex: 1 }} />
        <Button label="Respond" icon={<HeartHandshake size={18} color={Colors.white} />} onPress={() => respond(request)} style={{ flex: 1.4 }} />
      </>
    );
  }

  return (
    <Screen
      header={
        <StackHeader
          title="Request Details"
          subtitle={`Posted ${timeAgo(request.createdAt)}`}
          right={
            <HeaderIconButton label="Share request" onPress={share}>
              <Share2 size={20} color={Colors.text} />
            </HeaderIconButton>
          }
        />
      }
      footer={<View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>{footerContent}</View>}
      contentStyle={{ gap: 16 }}>
      <Card style={{ gap: 14 }}>
        <View style={styles.tagRow}>
          <Pill
            label={fulfilled ? 'FULFILLED' : pending ? 'PENDING REVIEW' : rejected ? 'NOT APPROVED' : u.label}
            color={fulfilled ? Colors.successDark : pending ? Colors.warning : rejected ? Colors.textMuted : u.color}
            bg={fulfilled ? Colors.successSoft : pending ? Colors.warningSoft : rejected ? Colors.background : u.bg}
            style={{ borderRadius: 8, height: 30 }}
          />
          {request.isMine && <Pill label="Your request" color={Colors.purpleDark} bg={Colors.purpleSoft} style={{ borderRadius: 8, height: 30 }} />}
          {responded && <Pill label="You responded" color={Colors.successDark} bg={Colors.successSoft} style={{ borderRadius: 8, height: 30 }} />}
        </View>
        <View style={styles.topRow}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.patient}>{request.patientName}</Text>
            <Text style={styles.meta}>
              Needs {request.units} unit{request.units > 1 ? 's' : ''} of {request.bloodGroup} blood
            </Text>
          </View>
          <BloodBadge group={request.bloodGroup} size="lg" />
        </View>
        <Text style={styles.desc}>{request.description}</Text>
        {pending && (
          <Text style={styles.meta}>
            Submitted for review{request.referenceCode ? ` · ${request.referenceCode}` : ''}. Donors are notified once the LifeLink team approves it.
          </Text>
        )}
        {rejected && !!request.statusReason && <Text style={styles.meta}>Reason: {request.statusReason}</Text>}
        <View style={styles.respondedRow}>
          <Users size={18} color={Colors.success} fill={Colors.success} />
          <Text style={styles.respondedText}>
            {request.respondedCount} donor{request.respondedCount === 1 ? '' : 's'} responded
          </Text>
        </View>
      </Card>

      {!request.isMine && !fulfilled && !pending && !rejected && (
        <View style={[styles.compat, !compatible && styles.incompatible]}>
          <CircleCheck size={20} color={Colors.white} fill={compatible ? Colors.success : Colors.warning} />
          <Text style={[styles.compatText, !compatible && { color: '#92400E' }]}>
            {!groupKnown
              ? 'Add your blood group in Edit Profile to check compatibility'
              : compatible
                ? `Your blood group (${state.user.bloodGroup}) is compatible with this request`
                : `Your blood group (${state.user.bloodGroup}) is not compatible — share this request instead`}
          </Text>
        </View>
      )}

      <Card style={{ paddingVertical: 6 }}>
        <InfoRow icon={Building2} iconColor={Colors.primary} iconBg={Colors.primarySoft} label="Hospital" value={request.hospitalName} />
        <InfoRow icon={MapPin} iconColor={Colors.warning} iconBg={Colors.warningSoft} label="Location" value={`${place(request.area, request.city)} · ${formatDistance(request.distanceKm)}`} />
        <InfoRow icon={User} iconColor={Colors.info} iconBg={Colors.infoSoft} label="Contact Person" value={request.contactName} />
        <InfoRow icon={Phone} iconColor={Colors.success} iconBg={Colors.successSoft} label="Phone" value={request.contactPhone} />
        <InfoRow icon={Clock} iconColor={Colors.purple} iconBg={Colors.purpleSoft} label="Posted" value={`${formatMonthDayYear(request.createdAt)} · ${formatTime(request.createdAt)}`} last />
      </Card>

      {request.hospitalId && (
        <Button label="View Hospital" variant="soft" icon={<Building2 size={18} color={Colors.primary} />} onPress={() => router.push(`/hospitals/${request.hospitalId}`)} />
      )}

      <Card style={{ gap: 12 }}>
        <Text style={styles.cardTitle}>Donation Guidelines</Text>
        {GUIDELINES.map((g) => (
          <View key={g} style={styles.guideline}>
            <CircleCheck size={18} color={Colors.white} fill={Colors.success} />
            <Text style={styles.guidelineText}>{g}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tagRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  patient: { fontSize: 22, fontWeight: '800', color: Colors.text },
  meta: { fontSize: 15, color: Colors.textSecondary },
  desc: { fontSize: 15, color: Colors.textSecondary, lineHeight: 23 },
  respondedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.successSoft,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 17,
  },
  respondedText: { color: Colors.successDark, fontWeight: '700', fontSize: 14 },
  compat: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: Colors.successSoft,
    borderWidth: 1.5,
    borderColor: Colors.successBorder,
    borderRadius: 16,
    padding: 14,
  },
  incompatible: { backgroundColor: Colors.warningSoft, borderColor: Colors.warningBorder },
  compatText: { flex: 1, color: '#065F46', fontWeight: '600', fontSize: 14, lineHeight: 20 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  guideline: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  guidelineText: { fontSize: 15, color: Colors.textSecondary, flex: 1 },
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
