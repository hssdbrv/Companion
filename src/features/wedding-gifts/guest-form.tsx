import { useState } from 'react';
import {
  KeyboardAvoidingView,Switch, Modal, Pressable, StyleSheet, TextInput, View,
} from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { parseAmount } from './format';
import type { Guest, GuestInput } from './use-guests';

type Props = {
  initial?: Guest | null;
  onSubmit: (input: GuestInput) => Promise<void>;
  onClose: () => void;
};

export function GuestForm({ initial, onSubmit, onClose }: Props) {
  const theme = useTheme();
  const [name, setName] = useState(initial?.name ?? '');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [saving, setSaving] = useState(false);
  const [attended, setAttended] = useState(initial ? !!initial.attended : true);


  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundElement, color: theme.text },
  ];

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSubmit({ name: name.trim(), amount: parseAmount(amount), note: note.trim(), attended });
    setSaving(false);
    onClose();
  };

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView behavior="padding">
        <View style={[styles.sheet, { backgroundColor: theme.background }]}>
          <ThemedText type="subtitle">{initial ? 'Edit guest' : 'New guest'}</ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="Guest name"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus
          />
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
            <Switch value={attended} onValueChange={setAttended} trackColor={{ true: theme.accent }} />
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
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});