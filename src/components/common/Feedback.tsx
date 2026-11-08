import * as Linking from 'expo-linking';
import { CircleAlert, CircleCheck, Info, MessageSquareText, Phone, X, type LucideIcon } from 'lucide-react-native';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { Shadows, TAB_BAR_HEIGHT } from '@/constants/theme';

import { Button } from './Button';
import { IconTile } from './Misc';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Tone = 'success' | 'error' | 'info';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  icon?: LucideIcon;
  tone?: 'primary' | 'success' | 'danger';
  /** Hide the cancel button (info dialogs) */
  hideCancel?: boolean;
  onConfirm?: () => void;
}

interface ContactTarget {
  name: string;
  phone: string;
  subtitle?: string;
}

interface FeedbackApi {
  toast: (message: string, tone?: Tone) => void;
  confirm: (options: ConfirmOptions) => void;
  contact: (target: ContactTarget) => void;
}

const FeedbackContext = createContext<FeedbackApi | null>(null);

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback must be used inside <FeedbackProvider>');
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toastState, setToastState] = useState<{ message: string; tone: Tone; key: number } | null>(null);
  const [dialog, setDialog] = useState<ConfirmOptions | null>(null);
  const [contactTarget, setContactTarget] = useState<ContactTarget | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;

  const toast = useCallback((message: string, tone: Tone = 'success') => {
    setToastState({ message, tone, key: Date.now() });
  }, []);

  useEffect(() => {
    if (!toastState) return;
    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    const t = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setToastState(null));
    }, 2400);
    return () => clearTimeout(t);
  }, [toastState, opacity]);

  const api = useMemo<FeedbackApi>(
    () => ({ toast, confirm: (o) => setDialog(o), contact: (c) => setContactTarget(c) }),
    [toast],
  );

  const openUrl = async (url: string, fallback: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      toast(fallback, 'error');
    }
  };

  const toneColor = dialog?.tone === 'success' ? Colors.success : dialog?.destructive || dialog?.tone === 'danger' ? Colors.danger : Colors.primary;
  const toneBg = dialog?.tone === 'success' ? Colors.successSoft : dialog?.destructive || dialog?.tone === 'danger' ? Colors.dangerSoft : Colors.primarySoft;
  const DialogIcon = dialog?.icon ?? (dialog?.destructive ? CircleAlert : Info);
  const ToastIcon = toastState?.tone === 'error' ? CircleAlert : toastState?.tone === 'info' ? Info : CircleCheck;

  return (
    <FeedbackContext.Provider value={api}>
      {children}

      {/* Confirm dialog */}
      <Modal visible={!!dialog} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setDialog(null)}>
        <Pressable style={styles.backdrop} onPress={() => setDialog(null)}>
          <Pressable style={styles.dialog} onPress={() => undefined}>
            <IconTile icon={DialogIcon} color={toneColor} bg={toneBg} size={64} radius={22} />
            <Text style={styles.dialogTitle}>{dialog?.title}</Text>
            <Text style={styles.dialogMessage}>{dialog?.message}</Text>
            <View style={styles.dialogActions}>
              {!dialog?.hideCancel && (
                <Button
                  label={dialog?.cancelLabel ?? 'Cancel'}
                  variant="soft"
                  color={Colors.textSecondary}
                  onPress={() => setDialog(null)}
                  style={{ flex: 1 }}
                />
              )}
              <Button
                label={dialog?.confirmLabel ?? 'Confirm'}
                variant="solid"
                color={toneColor}
                onPress={() => {
                  const cb = dialog?.onConfirm;
                  setDialog(null);
                  cb?.();
                }}
                style={{ flex: 1 }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Contact sheet */}
      <Modal
        visible={!!contactTarget}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setContactTarget(null)}>
        <Pressable style={[styles.backdrop, { justifyContent: 'flex-end', padding: 0 }]} onPress={() => setContactTarget(null)}>
          <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]} onPress={() => undefined}>
            <View style={styles.grabber} />
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>Contact {contactTarget?.name}</Text>
                <Text style={styles.sheetSubtitle}>{contactTarget?.subtitle ?? contactTarget?.phone}</Text>
              </View>
              <Pressable onPress={() => setContactTarget(null)} hitSlop={10} accessibilityLabel="Close" style={styles.close}>
                <X size={18} color={Colors.textSecondary} />
              </Pressable>
            </View>
            <SheetOption
              icon={Phone}
              color={Colors.success}
              bg={Colors.successSoft}
              title="Call"
              subtitle={contactTarget?.phone ?? ''}
              onPress={() => {
                const phone = contactTarget?.phone ?? '';
                setContactTarget(null);
                openUrl(`tel:${phone.replace(/[^\d+]/g, '')}`, 'Calling is not supported on this device');
              }}
            />
            <SheetOption
              icon={MessageSquareText}
              color={Colors.info}
              bg={Colors.infoSoft}
              title="Send SMS"
              subtitle="Opens your messaging app"
              onPress={() => {
                const phone = contactTarget?.phone ?? '';
                setContactTarget(null);
                openUrl(`sms:${phone.replace(/[^\d+]/g, '')}`, 'SMS is not supported on this device');
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Toast */}
      {toastState && (
        <Animated.View
          pointerEvents="none"
          style={[styles.toast, { bottom: TAB_BAR_HEIGHT + insets.bottom + 24, opacity }]}>
          <ToastIcon
            size={20}
            color={toastState.tone === 'error' ? '#FCA5A5' : toastState.tone === 'info' ? '#93C5FD' : '#6EE7B7'}
          />
          <Text style={styles.toastText}>{toastState.message}</Text>
        </Animated.View>
      )}
    </FeedbackContext.Provider>
  );
}

function SheetOption({
  icon,
  color,
  bg,
  title,
  subtitle,
  onPress,
}: {
  icon: LucideIcon;
  color: string;
  bg: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.option, pressed && { backgroundColor: '#F8FAFC' }]} accessibilityRole="button">
      <IconTile icon={icon} color={color} bg={bg} size={50} iconSize={22} radius={16} />
      <View style={{ flex: 1 }}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', padding: 24 },
  dialog: {
    backgroundColor: Colors.surface,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    ...Shadows.raised,
  },
  dialogTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, textAlign: 'center', marginTop: 6 },
  dialogMessage: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  dialogActions: { flexDirection: 'row', gap: 12, marginTop: 12, alignSelf: 'stretch' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 6,
  },
  grabber: { width: 44, height: 5, borderRadius: 3, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 10 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sheetTitle: { fontSize: 19, fontWeight: '800', color: Colors.text },
  sheetSubtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 2 },
  close: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10, borderRadius: 16 },
  optionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  optionSubtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  toast: {
    position: 'absolute',
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    ...Shadows.raised,
  },
  toastText: { color: Colors.white, fontSize: 14, fontWeight: '600', flex: 1 },
});
