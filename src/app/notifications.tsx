import { router } from 'expo-router';
import { BellOff, CheckCheck, Trash2, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { NotificationIcon } from '@/components/cards/ListItems';
import { Card } from '@/components/common/Card';
import { Chip } from '@/components/common/Chip';
import { useFeedback } from '@/components/common/Feedback';
import { HeaderIconButton, StackHeader } from '@/components/common/Headers';
import { EmptyState } from '@/components/common/Misc';
import { Screen } from '@/components/common/Screen';
import { Colors } from '@/constants/colors';
import { useApp } from '@/store/AppStore';
import type { AppNotification } from '@/types';
import { timeAgo } from '@/utils/date';

const DAY = 24 * 60 * 60 * 1000;

export default function Notifications() {
  const { state, actions } = useApp();
  const { confirm, toast } = useFeedback();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const unread = state.notifications.filter((n) => !n.read).length;
  const list = state.notifications.filter((n) => (filter === 'unread' ? !n.read : true));

  const [now] = useState(() => Date.now()); // render-stable 'now' for grouping
  const today = list.filter((n) => now - Date.parse(n.createdAt) < DAY);
  const earlier = list.filter((n) => now - Date.parse(n.createdAt) >= DAY);

  const open = (n: AppNotification) => {
    actions.markNotificationRead(n.id);
    if (n.link) router.push(n.link as never);
  };

  const clearAll = () =>
    confirm({
      title: 'Delete all notifications?',
      message: 'This will remove every notification from this device.',
      confirmLabel: 'Clear All',
      destructive: true,
      icon: Trash2,
      onConfirm: () => {
        actions.clearNotifications();
        toast('All notifications cleared', 'info');
      },
    });

  const section = (title: string, items: AppNotification[]) =>
    items.length > 0 && (
      <View style={{ gap: 10 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {items.map((n) => (
          <Card key={n.id} padded={false} style={[!n.read && styles.unread]}>
            <Pressable onPress={() => open(n)} style={({ pressed }) => [styles.item, pressed && { opacity: 0.8 }]} accessibilityRole="button">
            <NotificationIcon type={n.type} size={48} />
            <View style={{ flex: 1, gap: 4 }}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, !n.read && { fontWeight: '800' }]} numberOfLines={1}>
                  {n.title}
                </Text>
                {!n.read && <View style={styles.dot} />}
              </View>
              <Text style={styles.body}>{n.body}</Text>
              <Text style={styles.time}>{timeAgo(n.createdAt)}</Text>
            </View>
            </Pressable>
            <Pressable
              onPress={() => {
                actions.deleteNotification(n.id);
                toast('Notification removed', 'info');
              }}
              hitSlop={10}
              style={styles.delete}
              accessibilityLabel={`Delete notification ${n.title}`}>
              <X size={16} color={Colors.textMuted} />
            </Pressable>
          </Card>
        ))}
      </View>
    );

  return (
    <Screen
      header={
        <StackHeader
          title="Notifications"
          subtitle={unread > 0 ? `${unread} unread` : 'All caught up'}
          right={
            state.notifications.length > 0 ? (
              <HeaderIconButton label="Clear all notifications" onPress={clearAll}>
                <Trash2 size={20} color={Colors.danger} />
              </HeaderIconButton>
            ) : undefined
          }
        />
      }
      contentStyle={{ gap: 18 }}>
      <View style={styles.toolbar}>
        <Chip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip label="Unread" count={unread} active={filter === 'unread'} onPress={() => setFilter('unread')} />
        <View style={{ flex: 1 }} />
        {unread > 0 && (
          <Pressable onPress={() => actions.markAllNotificationsRead()} style={styles.readAll} accessibilityRole="button">
            <CheckCheck size={18} color={Colors.primary} />
            <Text style={styles.readAllText}>Read all</Text>
          </Pressable>
        )}
      </View>

      {list.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title={filter === 'unread' ? 'No unread notifications' : 'No Notifications'}
          message="You're all caught up! Check back later for updates."
        />
      ) : (
        <>
          {section('Today', today)}
          {section('Earlier', earlier)}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  readAll: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  readAllText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  item: { flexDirection: 'row', gap: 14, padding: 14, alignItems: 'flex-start' },
  unread: { borderColor: Colors.primaryBorder, backgroundColor: '#FFFBFB' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 18 },
  title: { fontSize: 16, fontWeight: '600', color: Colors.text, flexShrink: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  body: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  time: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  delete: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
