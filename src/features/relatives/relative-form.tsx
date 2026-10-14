import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { parseYear } from './format';
import type { Relative, RelativeInput } from './use-relatives';

type Props = {
  initial?: Relative | null;
  onSubmit: (input: RelativeInput) => Promise<void>;
  onClose: () => void;
};

export function RelativeForm({ initial, onSubmit, onClose }: Props) {
  const theme = useTheme();
  const [name, setName] = useState(initial?.name ?? '');
  const [year, setYear] = useState(initial?.birth_year ? String(initial.birth_year) : '');
  const [deceased, setDeceased] = useState(!!initial?.deceased);
  const [yearError, setYearError] = useState(false);
  const [saving, setSaving] = useState(false);

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundElement, color: theme.text },
  ];

  const save = async () => {
    if (!name.trim()) return;
    const birthYear = year.trim() ? parseYear(year) : null;
    if (year.trim() && birthYear === null) {
      setYearError(true);
      return;
    }
    setSaving(true);
    await onSubmit({ name: name.trim(), birthYear, deceased });
    setSaving(false);
    onClose();
  };

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView behavior="padding">
        <View style={[styles.sheet, { backgroundColor: theme.background }]}>
          <ThemedText type="subtitle">{initial ? 'Edit person' : 'New relative'}</ThemedText>

          <TextInput
            style={inputStyle}
            placeholder="Full name"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus={!initial}
          />

          <View style={styles.field}>
            <TextInput
              style={inputStyle}
              placeholder="Birth year (optional)"
              placeholderTextColor={theme.textSecondary}
              value={year}
              onChangeText={(v) => {
                setYear(v);
                setYearError(false);
              }}
              keyboardType="number-pad"
              maxLength={4}
            />
            <ThemedText
              type="small"
              themeColor={yearError ? undefined : 'textSecondary'}
              style={yearError ? styles.error : undefined}>
              {yearError
                ? 'Enter a valid 4-digit year'
                : 'e.g. 1990 (Persian years like 1369 work too)'}
            </ThemedText>
          </View>

          <View style={styles.switchRow}>
            <ThemedText>Passed away</ThemedText>
            <Switch
              value={deceased}
              onValueChange={setDeceased}
              trackColor={{ true: theme.accent }}
            />
          </View>

          <Button title="Save" size="lg" fullWidth loading={saving} onPress={save} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    padding: Spacing.four,
    gap: Spacing.three,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  input: { height: 52, borderRadius: 16, paddingHorizontal: Spacing.three, fontSize: 16 },
  field: { gap: Spacing.one },
  error: { color: '#E5484D' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});