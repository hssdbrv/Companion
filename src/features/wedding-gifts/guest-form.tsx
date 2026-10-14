import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Avatar } from '@/features/relatives/avatar';
import { parseAmount } from './format';
import type { Guest, GuestInput, RelativeOption } from './use-guests';

type Props = {
  initial?: Guest | null;
  /** relatives that can still be picked (not yet linked to another gift record) */
  relatives: RelativeOption[];
  onSubmit: (input: GuestInput) => Promise<void>;
  onClose: () => void;
};

type Mode = 'relative' | 'other';

export function GuestForm({ initial, relatives, onSubmit, onClose }: Props) {
  const theme = useTheme();
  const { height } = useWindowDimensions();

  const [mode, setMode] = useState<Mode>(
    initial ? (initial.relative_id !== null ? 'relative' : 'other') : relatives.length ? 'relative' : 'other',
  );
  const [relativeId, setRelativeId] = useState<number | null>(initial?.relative_id ?? null);
  const [query, setQuery] = useState('');
  const [name, setName] = useState(initial && initial.relative_id === null ? initial.name : '');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [attended, setAttended] = useState(initial ? !!initial.attended : true);
  const [saving, setSaving] = useState(false);

  const q = query.trim().toLowerCase();
  const visible = q ? relatives.filter((r) => r.name.toLowerCase().includes(q)) : relatives;
  const chosen = relatives.find((r) => r.id === relativeId);

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundElement, color: theme.text },
  ];

  const save = async () => {
    const guestName = mode === 'relative' ? chosen?.name : name.trim();
    if (!guestName) return;
    setSaving(true);
    await onSubmit({
      name: guestName,
      amount: parseAmount(amount),
      note: note.trim(),
      attended,
      relativeId: mode === 'relative' ? relativeId : null,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView behavior="padding">
        <View style={[styles.sheet, { backgroundColor: theme.background }]}>
          <ThemedText type="subtitle">{initial ? 'Edit gift' : 'New gift'}</ThemedText>

          <ScrollView
            style={{ maxHeight: height * 0.6 }}
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled">
            <View style={styles.chips}>
              {(['relative', 'other'] as const).map((m) => {
                const on = mode === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setMode(m)}
                    style={[
                      styles.chip,
                      { backgroundColor: on ? theme.accent : theme.backgroundElement },
                    ]}>
                    <ThemedText type="small" style={{ color: on ? theme.onAccent : theme.text }}>
                      {m === 'relative' ? 'From relatives' : 'Other guest'}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            {mode === 'relative' ? (
              relatives.length === 0 ? (
                <ThemedText themeColor="textSecondary">
                  No relatives available. Add some in Relatives, or choose Other guest.
                </ThemedText>
              ) : (
                <>
                  <TextInput
                    style={inputStyle}
                    placeholder="Search relatives"
                    placeholderTextColor={theme.textSecondary}
                    value={query}
                    onChangeText={setQuery}
                  />
                  <ScrollView
                    nestedScrollEnabled
                    style={styles.list}
                    contentContainerStyle={{ gap: Spacing.two }}
                    keyboardShouldPersistTaps="handled">
                    {visible.map((r) => (
                      <Pressable
                        key={r.id}
                        onPress={() => setRelativeId(r.id)}
                        style={[
                          styles.row,
                          {
                            backgroundColor: theme.backgroundElement,
                            borderColor: relativeId === r.id ? theme.accent : 'transparent',
                          },
                        ]}>
                        <Avatar id={r.id} name={r.name} size={32} />
                        <ThemedText type="smallBold">{r.name}</ThemedText>
                      </Pressable>
                    ))}
                  </ScrollView>
                </>
              )
            ) : (
              <TextInput
                style={inputStyle}
                placeholder="Guest name"
                placeholderTextColor={theme.textSecondary}
                value={name}
                onChangeText={setName}
              />
            )}

            <TextInput
              style={inputStyle}
              placeholder="Gift amount (Toman)"
              placeholderTextColor={theme.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
            />
            <TextInput
              style={inputStyle}
              placeholder="Note (optional)"
              placeholderTextColor={theme.textSecondary}
              value={note}
              onChangeText={setNote}
            />
            <View style={styles.switchRow}>
              <ThemedText>Attended</ThemedText>
              <Switch
                value={attended}
                onValueChange={setAttended}
                trackColor={{ true: theme.accent }}
              />
            </View>
          </ScrollView>

          <Button
            title="Save"
            size="lg"
            fullWidth
            loading={saving}
            disabled={mode === 'relative' ? !chosen : !name.trim()}
            onPress={save}
          />
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
  form: { gap: Spacing.three },
  chips: { flexDirection: 'row', gap: Spacing.two },
  chip: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 999 },
  input: { height: 52, borderRadius: 16, paddingHorizontal: Spacing.three, fontSize: 16 },
  list: { maxHeight: 180 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: 16,
    borderWidth: 2,
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});