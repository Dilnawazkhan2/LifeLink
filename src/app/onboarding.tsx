import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Check, Users } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import { BloodDropIcon, MedicalIcon } from '@/components/icons';
import { Accents, Colors } from '@/constants/colors';
import { useApp } from '@/store/AppStore';

type Accent = (typeof Accents)[keyof typeof Accents];

interface Slide {
  key: string;
  title: string;
  body: string;
  accent: Accent;
  icon: (color: string) => React.ReactNode;
}

const SLIDES: Slide[] = [
  {
    key: 'donate',
    title: 'Donate Blood,\nSave Lives',
    body: 'Every donation can save up to 3 lives. Join thousands of heroes who give the gift of life every day.',
    accent: Accents.red,
    icon: (c) => <BloodDropIcon size={76} color={Colors.white} accent={c} />,
  },
  {
    key: 'connect',
    title: 'Connect with\nDonors Nearby',
    body: 'Find verified blood donors in your area instantly. Filter by blood type and location for fast matches.',
    accent: Accents.blue,
    icon: () => <Users size={72} color={Colors.white} fill={Colors.white} />,
  },
  {
    key: 'hospitals',
    title: 'Partner\nHospitals',
    body: 'Real-time blood inventory from 47+ partner hospitals. Get alerts when your blood type is critically needed.',
    accent: Accents.green,
    icon: () => <MedicalIcon size={72} color={Colors.white} />,
  },
];

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { actions } = useApp();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;
  const accent = SLIDES[index].accent;

  const goTo = (i: number) => {
    listRef.current?.scrollToOffset({ offset: i * width, animated: true });
    setIndex(i);
  };

  const finish = () => {
    actions.completeOnboarding();
    router.replace('/login');
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.topBar}>
        {index > 0 ? (
          <Pressable onPress={() => goTo(index - 1)} hitSlop={12} style={styles.topAction} accessibilityRole="button" accessibilityLabel="Previous">
            <ArrowLeft size={18} color={Colors.textMuted} />
            <Text style={styles.topText}>Back</Text>
          </Pressable>
        ) : (
          <View />
        )}
        {!isLast && (
          <Pressable onPress={finish} hitSlop={12} accessibilityRole="button" accessibilityLabel="Skip onboarding">
            <Text style={styles.topText}>Skip</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.key}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <LinearGradient colors={[item.accent.bgTop, item.accent.bgBottom]} style={styles.panel}>
              <View style={[styles.bubble, { top: 48, left: 48, width: 32, height: 32 }]} />
              <View style={[styles.bubble, { bottom: 64, right: 64, width: 48, height: 48 }]} />
              <View style={[styles.iconTile, { backgroundColor: item.accent.main }]}>{item.icon(item.accent.main)}</View>
            </LinearGradient>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <Pressable
            key={s.key}
            onPress={() => goTo(i)}
            hitSlop={6}
            accessibilityLabel={`Go to slide ${i + 1}`}
            style={[styles.dot, i === index && { width: 24, backgroundColor: accent.main }]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          label={isLast ? 'Get Started' : 'Continue'}
          variant="solid"
          color={accent.main}
          size="lg"
          onPress={() => (isLast ? finish() : goTo(index + 1))}
          iconRight={isLast ? <Check size={24} color={Colors.white} /> : <ArrowRight size={24} color={Colors.white} />}
          style={{
            shadowColor: accent.main,
            shadowOpacity: 0.3,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
  topAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  topText: { fontSize: 17, fontWeight: '500', color: Colors.textMuted },
  slide: { paddingHorizontal: 24, alignItems: 'center' },
  panel: {
    alignSelf: 'stretch',
    aspectRatio: 1,
    maxHeight: 340,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bubble: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.55)' },
  iconTile: { width: 120, height: 120, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginTop: 44,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  body: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 23, marginTop: 18, paddingHorizontal: 8 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 24, marginTop: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E7EB' },
  footer: { paddingHorizontal: 24 },
});
