import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Avatar } from './avatar';
import { RELATION_OPTIONS, type RelationOption } from './format';
import type { Relative } from './use-relatives';

type Props = {
  person: Relative;
  others: Relative[];
  onSubmit: (option: RelationOption, otherId: number) => Promise<void>;
  onClose: () => void;
};

export function RelationPicker({ person, others, onSubmit, onClose }: Props) {
  const theme = useTheme();
  const [optionKey, setOptionKey] = useState(RELATION_OPTIONS[0].key);
  const [selected, setSelected] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const option = RELATION_OPTIONS.find((o) => o.key === optionKey) ?? RELATION_OPTIONS[0];
  const q = query.trim().toLowerCase();
  const visible = q ? others.filter((r) => r.name.toLowerCase().includes(q)) : others;
  const chosen = others.find((r) => r.id === selected);

  const save = async () => {
    if (selected === null) return;
    setSaving(true);
    await onSubmit(option, selected);
    setSaving(false);
    onClose();
  };

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView behavior="padding">
        <View style={[styles.sheet, { backgroundColor: theme.background }]}>
          <ThemedText type="subtitle">Add relationship</ThemedText>

          <View style={styles.chips}>
            {RELATION_OPTIONS.map((o) => {
              const on = o.key === optionKey;
              return (
                <Pressable
                  key={o.key}
                  onPress={() => setOptionKey(o.key)}
                  style={[
                    styles.chip,
                    { backgroundColor: on ? theme.accent : theme.backgroundElement },
                  ]}>
                  <ThemedText type="small" style={{ color: on ? theme.onAccent : theme.text }}>
                    {o.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <ThemedText themeColor="textSecondary">
            {person.name} is {option.label.toLowerCase()} {chosen ? chosen.name : '…'}
          </ThemedText>

          {others.length === 0 ? (
            <ThemedText themeColor="textSecondary">
              Add more relatives first, then link them here.
            </ThemedText>
          ) : (
            <>
              <TextInput
                style={[styles.search, { backgroundColor: theme.backgroundElement, color: theme.text }]}
                placeholder="Search people"
                placeholderTextColor={theme.textSecondary}
                value={query}
                onChangeText={setQuery}
              />
              <FlatList
                data={visible}
                keyExtractor={(r) => String(r.id)}
                style={styles.list}
                contentContainerStyle={{ gap: Spacing.two }}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => setSelected(item.id)}
                    style={[
                      styles.row,
                      {
                        backgroundColor: theme.backgroundElement,
                        borderColor: selected === item.id ? theme.accent : 'transparent',
                      },
                    ]}>
                    <Avatar id={item.id} name={item.name} size={36} />
                    <ThemedText type="smallBold">{item.name}</ThemedText>
                  </Pressable>
                )}
              />
            </>
          )}

          <Button
            title="Save"
            size="lg"
            fullWidth
            loading={saving}
            disabled={selected === null}
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 999 },
  search: { height: 48, borderRadius: 16, paddingHorizontal: Spacing.three, fontSize: 16 },
  list: { maxHeight: 240 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: 16,
    borderWidth: 2,
  },
});