import { Search, X } from 'lucide-react-native';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { Shadows, webNoOutline } from '@/constants/theme';

interface Props {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
}

export function SearchBar({ value, onChangeText, placeholder }: Props) {
  return (
    <View style={styles.wrap}>
      <Search size={22} color={Colors.textMuted} strokeWidth={2.2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        style={styles.input}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel={placeholder}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={10} accessibilityLabel="Clear search" style={styles.clear}>
          <X size={14} color={Colors.white} strokeWidth={3} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 54,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    ...Shadows.soft,
  },
  input: { flex: 1, fontSize: 16, color: Colors.text, paddingVertical: 0, ...webNoOutline },
  clear: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.textFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
