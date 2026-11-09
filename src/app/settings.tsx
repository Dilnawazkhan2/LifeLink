import { router } from 'expo-router';
import {
  Bell,
  BellRing,
  CircleHelp,
  Eye,
  FileText,
  Info,
  LogOut,
  Mail,
  MapPin,
  MessageSquareText,
  RotateCcw,
  Shield,
  Siren,
} from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/common/Card';
import { Chip } from '@/components/common/Chip';
import { useFeedback } from '@/components/common/Feedback';
import { StackHeader } from '@/components/common/Headers';
import { ListRow, ToggleRow } from '@/components/common/Misc';
import { Screen } from '@/components/common/Screen';
import { Colors } from '@/constants/colors';
import { backendLabel } from '@/services/backend';
import { useApp } from '@/store/AppStore';
import type { AppSettings } from '@/types';

const RADII = [5, 10, 25, 50];

const INFO_PAGES = {
  privacy: {
    title: 'Privacy & Security',
    message:
      'Your phone number is only shared with requesters after you accept a request. Location is used to show distance and is never shown precisely. All data in this demo stays on your device.',
  },
  help: {
    title: 'Help & Support',
    message:
      'Need help? Email support@lifelink.pk or call the LifeLink helpline at 0800-LIFELINK (9 AM – 9 PM). For medical emergencies, call 1122.',
  },
  terms: {
    title: 'Terms of Service',
    message:
      'LifeLink connects voluntary blood donors with patients. Donations must be voluntary and unpaid. Users must provide accurate information and must not misuse requests.',
  },
  policy: {
    title: 'Privacy Policy',
    message:
      'We collect only the information needed to match donors with requests: name, blood group, contact number and approximate location. We never sell personal data.',
  },
} as const;

export default function Settings() {
  const { state, actions } = useApp();
  const { confirm, toast } = useFeedback();
  const s = state.settings;

  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K], label?: string) => {
    actions.updateSettings({ [key]: value } as Partial<AppSettings>);
    if (label) toast(`${label} ${value ? 'enabled' : 'disabled'}`, 'info');
  };

  const showInfo = (key: keyof typeof INFO_PAGES) =>
    confirm({ ...INFO_PAGES[key], confirmLabel: 'Got it', hideCancel: true, icon: Info });

  return (
    <Screen header={<StackHeader title="Settings" subtitle="App preferences" />} contentStyle={{ gap: 16 }}>
      <Text style={styles.group}>Notifications</Text>
      <Card style={styles.card}>
        <ToggleRow icon={Bell} iconColor={Colors.warning} iconBg={Colors.warningSoft} title="Push Notifications" subtitle="Requests, messages and updates" value={s.pushNotifications} onValueChange={(v) => set('pushNotifications', v, 'Push notifications')} />
        <ToggleRow icon={Siren} iconColor={Colors.danger} iconBg={Colors.dangerSoft} title="Emergency Alerts" subtitle="Critical requests for your blood group" value={s.emergencyAlerts} onValueChange={(v) => set('emergencyAlerts', v, 'Emergency alerts')} />
        <ToggleRow icon={MessageSquareText} iconColor={Colors.success} iconBg={Colors.successSoft} title="SMS Alerts" subtitle="Text me when internet is unavailable" value={s.smsAlerts} onValueChange={(v) => set('smsAlerts', v, 'SMS alerts')} />
        <ToggleRow icon={Mail} iconColor={Colors.info} iconBg={Colors.infoSoft} title="Email Updates" subtitle="Monthly impact summary" value={s.emailUpdates} onValueChange={(v) => set('emailUpdates', v, 'Email updates')} last />
      </Card>

      <Text style={styles.group}>Privacy & Location</Text>
      <Card style={styles.card}>
        <ToggleRow icon={Eye} iconColor={Colors.purple} iconBg={Colors.purpleSoft} title="Show Me in Donor Search" subtitle="Requesters can find and contact you" value={s.showInSearch} onValueChange={(v) => set('showInSearch', v, 'Donor visibility')} />
        <ToggleRow icon={MapPin} iconColor={Colors.primary} iconBg={Colors.primarySoft} title="Share Approximate Location" subtitle="Used to calculate distance" value={s.shareLocation} onValueChange={(v) => set('shareLocation', v, 'Location sharing')} last />
      </Card>

      <Text style={styles.group}>Search Radius</Text>
      <Card style={{ gap: 12 }}>
        <View style={styles.radiusHead}>
          <BellRing size={18} color={Colors.textMuted} />
          <Text style={styles.radiusText}>Alert me about requests within {s.searchRadiusKm} km</Text>
        </View>
        <View style={styles.radii}>
          {RADII.map((r) => (
            <Chip key={r} label={`${r} km`} active={s.searchRadiusKm === r} onPress={() => set('searchRadiusKm', r)} />
          ))}
        </View>
      </Card>

      <Text style={styles.group}>Support</Text>
      <Card style={styles.card}>
        <ListRow icon={Shield} iconColor={Colors.info} iconBg={Colors.infoSoft} title="Privacy & Security" onPress={() => showInfo('privacy')} />
        <ListRow icon={CircleHelp} iconColor={Colors.success} iconBg={Colors.successSoft} title="Help & Support" onPress={() => showInfo('help')} />
        <ListRow icon={FileText} iconColor={Colors.textSecondary} iconBg="#F1F5F9" title="Terms of Service" onPress={() => showInfo('terms')} />
        <ListRow icon={FileText} iconColor={Colors.textSecondary} iconBg="#F1F5F9" title="Privacy Policy" onPress={() => showInfo('policy')} />
        <ListRow icon={Info} iconColor={Colors.textMuted} iconBg="#F8FAFC" title="About LifeLink" subtitle="Version 1.0.0" onPress={() => router.push('/about')} last />
      </Card>

      <Text style={styles.group}>{state.mode === 'live' ? 'Account' : 'Demo'}</Text>
      <Card style={styles.card}>
        {state.mode === 'live' ? (
          <ListRow
            icon={RotateCcw}
            iconColor={Colors.info}
            iconBg={Colors.infoSoft}
            title="Sync Now"
            subtitle={`Connected to ${backendLabel}`}
            onPress={async () => {
              await actions.refresh();
              toast('Data refreshed');
            }}
          />
        ) : (
        <ListRow
          icon={RotateCcw}
          iconColor={Colors.warningDark}
          iconBg={Colors.warningSoft}
          title="Reset Demo Data"
          subtitle="Restore the original mock data"
          onPress={() =>
            confirm({
              title: 'Reset demo data?',
              message: 'Your posted requests, responses, donations, notifications and profile edits will be reset.',
              confirmLabel: 'Reset',
              destructive: true,
              icon: RotateCcw,
              onConfirm: async () => {
                await actions.resetDemoData();
                toast('Demo data restored');
              },
            })
          }
        />
        )}
        <ListRow
          icon={LogOut}
          iconColor={Colors.danger}
          iconBg={Colors.dangerSoft}
          title="Sign Out"
          titleColor={Colors.danger}
          onPress={() =>
            confirm({
              title: 'Sign Out',
              message: 'Are you sure you want to sign out?',
              confirmLabel: 'Sign Out',
              destructive: true,
              icon: LogOut,
              onConfirm: async () => {
                await actions.logout();
                router.replace('/login');
              },
            })
          }
          last
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { fontSize: 13, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 },
  card: { paddingVertical: 4 },
  radiusHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  radiusText: { fontSize: 15, color: Colors.textSecondary, flex: 1 },
  radii: { flexDirection: 'row', gap: 9, flexWrap: 'wrap' },
});
