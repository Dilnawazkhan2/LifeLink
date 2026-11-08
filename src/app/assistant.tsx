import { RotateCcw, Send, Sparkles } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFeedback } from '@/components/common/Feedback';
import { HeaderIconButton, StackHeader } from '@/components/common/Headers';
import { Colors } from '@/constants/colors';
import { SCREEN_PADDING, webNoOutline } from '@/constants/theme';
import { ASSISTANT_GREETING, SUGGESTED_QUESTIONS } from '@/data/assistant';
import { askAssistant } from '@/services/assistant';
import { useApp } from '@/store/AppStore';
import { formatTime } from '@/utils/date';

export default function Assistant() {
  const insets = useSafeAreaInsets();
  const { state, actions } = useApp();
  const { confirm } = useFeedback();
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const messages = state.chat;

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [messages.length, thinking]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || thinking) return;
    setInput('');
    actions.addChatMessage('user', q);
    setThinking(true);
    const answer = await askAssistant(q);
    actions.addChatMessage('assistant', answer);
    setThinking(false);
  };

  const reset = () =>
    confirm({
      title: 'Clear conversation?',
      message: 'This removes all messages in this chat.',
      confirmLabel: 'Clear',
      destructive: true,
      onConfirm: actions.clearChat,
    });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StackHeader
        title="AI Health Assistant"
        subtitle="Demo · answers are generated locally"
        right={
          messages.length > 0 ? (
            <HeaderIconButton label="Clear conversation" onPress={reset}>
              <RotateCcw size={19} color={Colors.text} />
            </HeaderIconButton>
          ) : undefined
        }
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.botRow}>
            <View style={styles.botAvatar}>
              <Sparkles size={18} color={Colors.white} />
            </View>
            <View style={[styles.bubble, styles.botBubble]}>
              <Text style={styles.botText}>{ASSISTANT_GREETING}</Text>
            </View>
          </View>

          {messages.length === 0 && (
            <View style={styles.suggestions}>
              <Text style={styles.suggestTitle}>Suggested Questions</Text>
              {SUGGESTED_QUESTIONS.map((q) => (
                <Pressable key={q} onPress={() => send(q)} style={({ pressed }) => [styles.suggestion, pressed && { opacity: 0.8 }]} accessibilityRole="button">
                  <Text style={styles.suggestionText}>{q}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {messages.map((m) =>
            m.role === 'user' ? (
              <View key={m.id} style={styles.userRow}>
                <View style={[styles.bubble, styles.userBubble]}>
                  <Text style={styles.userText}>{m.text}</Text>
                </View>
                <Text style={[styles.time, { alignSelf: 'flex-end' }]}>{formatTime(m.createdAt)}</Text>
              </View>
            ) : (
              <View key={m.id} style={styles.botRow}>
                <View style={styles.botAvatar}>
                  <Sparkles size={18} color={Colors.white} />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={[styles.bubble, styles.botBubble]}>
                    <Text style={styles.botText}>{m.text}</Text>
                  </View>
                  <Text style={styles.time}>{formatTime(m.createdAt)}</Text>
                </View>
              </View>
            ),
          )}

          {thinking && (
            <View style={styles.botRow}>
              <View style={styles.botAvatar}>
                <Sparkles size={18} color={Colors.white} />
              </View>
              <View style={[styles.bubble, styles.botBubble, styles.typing]}>
                <ActivityIndicator size="small" color={Colors.purple} />
                <Text style={styles.typingText}>Thinking…</Text>
              </View>
            </View>
          )}

          <Text style={styles.disclaimer}>
            LifeLink AI gives general information only and is not medical advice.
          </Text>
        </ScrollView>

        <View style={[styles.composer, { paddingBottom: insets.bottom + 10 }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about blood donation..."
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
            multiline
            maxLength={500}
            onSubmitEditing={() => send(input)}
            blurOnSubmit
            returnKeyType="send"
            accessibilityLabel="Message"
          />
          <Pressable
            onPress={() => send(input)}
            disabled={!input.trim() || thinking}
            style={[styles.send, (!input.trim() || thinking) && { opacity: 0.45 }]}
            accessibilityRole="button"
            accessibilityLabel="Send message">
            <Send size={20} color={Colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  list: { paddingHorizontal: SCREEN_PADDING, paddingBottom: 20, gap: 14 },
  botRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingRight: 30 },
  botAvatar: { width: 34, height: 34, borderRadius: 12, backgroundColor: Colors.purple, alignItems: 'center', justifyContent: 'center' },
  bubble: { borderRadius: 20, paddingHorizontal: 15, paddingVertical: 12 },
  botBubble: { backgroundColor: Colors.surface, borderTopLeftRadius: 6, borderWidth: 1, borderColor: Colors.border, flexShrink: 1 },
  botText: { fontSize: 15, color: Colors.text, lineHeight: 22 },
  userRow: { alignItems: 'flex-end', paddingLeft: 50, gap: 4 },
  userBubble: { backgroundColor: Colors.primary, borderTopRightRadius: 6 },
  userText: { fontSize: 15, color: Colors.white, lineHeight: 22 },
  time: { fontSize: 11, color: Colors.textMuted },
  typing: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingText: { color: Colors.textMuted, fontSize: 14 },
  suggestions: { gap: 8, paddingLeft: 44 },
  suggestTitle: { fontSize: 13, fontWeight: '700', color: Colors.textMuted, marginBottom: 2 },
  suggestion: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.purpleSoft,
    borderWidth: 1,
    borderColor: Colors.purpleBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  suggestionText: { color: Colors.purpleDark, fontWeight: '600', fontSize: 14 },
  disclaimer: { fontSize: 12, color: Colors.textFaint, textAlign: 'center', marginTop: 8 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: Colors.inputBg,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: 13,
    fontSize: 15,
    color: Colors.text,
    ...webNoOutline,
  },
  send: { width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
});
