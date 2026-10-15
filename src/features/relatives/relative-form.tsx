import { Host, Switch } from '@expo/ui';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppSheet } from '@/components/app-sheet';
import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { parseYear, SEX_LABEL, type Sex } from './format';
import type { Relative, RelativeInput } from './use-relatives';

type Props = {
  initial?: Relative | null;
  onSubmit: (input: RelativeInput) => Promise<void>;
  onClose: () => void;
};

export function RelativeForm({ initial, onSubmit, onClose }: Props) {
  const theme = useTheme();
  const [firstName, setFirstName] = useState(initial?.first_name ?? '');
  const [lastName, setLastName] = useState(initial?.last_name ?? '');
  const [year, setYear] = useState(initial?.birth_year ? String(initial.birth_year) : '');
  const [deceased, setDeceased] = useState(!!initial?.deceased);
  const [sex, setSex] = useState<Sex | null>(initial?.sex ?? null);
  const [isHead, setIsHead] = useState(!!initial?.is_head);
  const [sexError, setSexError] = useState(false);
  const [yearError, setYearError] = useState(false);
  const [saving, setSaving] = useState(false);

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundElement, color: theme.text },
  ];

  const save = async (close: () => void) => {
    if (!firstName.trim()) return;
    if (!sex) {
      setSexError(true);
      return;
    }
    const birthYear = year.trim() ? parseYear(year) : null;
    if (year.trim() && birthYear === null) {
      setYearError(true);
      return;
    }
    setSaving(true);
    await onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthYear,
      deceased,
      sex,
      isHead,
    });
    setSaving(false);
    close();
  };

  return (
    <AppSheet onClose={onClose}>
      {(close) => (
        <>
          <ThemedText type="subtitle">{initial ? 'Edit person' : 'New relative'}</ThemedText>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled>
            <TextInput
              style={inputStyle}
              placeholder="First name"
              placeholderTextColor={theme.textSecondary}
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={inputStyle}
              placeholder="Last name"
              placeholderTextColor={theme.textSecondary}
              value={lastName}
              onChangeText={setLastName}
            />

            <View style={styles.field}>
              <View style={styles.chips}>
                {(['male', 'female'] as const).map((value) => {
                  const on = sex === value;
                  return (
                    <Pressable
                      key={value}
                      onPress={() => {
                        setSex(value);
                        setSexError(false);
                      }}
                      style={[
                        styles.chip,
                        { backgroundColor: on ? theme.accent : theme.backgroundElement },
                      ]}>
                      <ThemedText type="small" style={{ color: on ? theme.onAccent : theme.text }}>
                        {SEX_LABEL[value]}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
              {sexError && (
                <ThemedText type="small" style={styles.error}>
                  Choose male or female
                </ThemedText>
              )}
            </View>

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

            <Host matchContents={{ vertical: true }} style={styles.fullWidth}>
              <Switch label="Passed away" value={deceased} onValueChange={setDeceased} />
            </Host>

            <Host matchContents={{ vertical: true }} style={styles.fullWidth}>
              <Switch label="Head of family" value={isHead} onValueChange={setIsHead} />
            </Host>

            <Button
              title="Save"
              size="lg"
              fullWidth
              loading={saving}
              disabled={!firstName.trim()}
              onPress={() => save(close)}
            />
          </ScrollView>
        </>
      )}
    </AppSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // extra bottom space lets every field be scrolled above the keyboard
  form: { gap: Spacing.three, paddingBottom: 280 },
  input: { height: 52, borderRadius: 16, paddingHorizontal: Spacing.three, fontSize: 16 },
  field: { gap: Spacing.one },
  chips: { flexDirection: 'row', gap: Spacing.two },
  chip: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.two, borderRadius: 999 },
  error: { color: '#E5484D' },
  fullWidth: { width: '100%' },
});