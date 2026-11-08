import { Eye, EyeOff, type LucideIcon } from 'lucide-react-native';
import { forwardRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';

import { Colors } from '@/constants/colors';

interface Props extends Omit<TextInputProps, 'style'> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  hint?: string;
  password?: boolean;
  multiline?: boolean;
}

export const TextField = forwardRef<TextInputInstance, Props>(function TextField(
  { label, icon: Icon, error, hint, password, multiline, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.field}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrap,
          multiline && styles.multilineWrap,
          focused && styles.focused,
          !!error && styles.errored,
        ]}>
        {Icon && (
          <Icon
            size={20}
            color={error ? Colors.danger : focused ? Colors.primary : Colors.textMuted}
            strokeWidth={1.8}
            style={multiline ? { marginTop: 2 } : undefined}
          />
        )}
        <TextInput
          ref={ref}
          {...rest}
          multiline={multiline}
          secureTextEntry={password ? hidden : rest.secureTextEntry}
          placeholderTextColor={Colors.textMuted}
          style={[styles.input, multiline && styles.multilineInput]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          accessibilityLabel={label ?? rest.placeholder}
        />
        {password && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
            {hidden ? (
              <Eye size={22} color={Colors.textMuted} strokeWidth={1.8} />
            ) : (
              <EyeOff size={22} color={Colors.textMuted} strokeWidth={1.8} />
            )}
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { fontSize: 15, fontWeight: '600', color: '#334155' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: Colors.inputBg,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
  },
  multilineWrap: { alignItems: 'flex-start', paddingVertical: 14, minHeight: 110 },
  focused: { borderColor: Colors.primary, backgroundColor: Colors.surface },
  errored: { borderColor: Colors.danger, backgroundColor: Colors.dangerSoft },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 12,
    // Remove the browser focus ring when running on web (the wrapper shows focus instead).
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  multilineInput: { paddingVertical: 0, minHeight: 80, textAlignVertical: 'top' },
  error: { fontSize: 13, color: Colors.danger, fontWeight: '500' },
  hint: { fontSize: 13, color: Colors.textMuted },
});
