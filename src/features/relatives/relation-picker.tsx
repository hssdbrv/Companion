import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppSheet } from '@/components/app-sheet';
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
  /** called once per selected person */
  onSubmit: (option: RelationOption, otherId: number) => Promise<void>;
  onClose: () => void;
};

export function RelationPicker({ person, others, onSubmit, onClose }: Props) {
  const theme = useTheme();
  const [optionKey, setOptionKey] = useState(RELATION_OPTIONS[0].key);
  const [selected, setSelected] = useState<number[]>([]);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const option = RELATION_OPTIONS.find((o) => o.key === optionKey) ?? RELATION_OPTIONS[0];
  const q = query.trim().toLowerCase();
  const visible = q ? others.filter((r) => r.name.toLowerCase().includes(q)) : others;
  const chosenNames = others
    .filter((r) => selected.includes(r.id))
    .map((r) => r.name)
    .join(', ');

  const toggle = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const save = async (close: () => void) => {
    if (selected.length === 0) return;
    setSaving(true);
    for (const otherId of selected) {
      await onSubmit(option, otherId);
    }
    setSaving(false);
    close();
  };

  return (
    <AppSheet onClose={onClose}>
      {(close) => (
        <>
          {/* fixed part: nothing here scrolls */}
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
            {person.name} is {option.label.toLowerCase()} {chosenNames || '…'}
          </ThemedText>

          {others.length === 0 ? (
            <ThemedText themeColor="textSecondary">
              Add more relatives first, then link them here.
            </ThemedText>
          ) : (
            <>
              <TextInput
                style={[
                  styles.search,
                  { backgroundColor: theme.backgroundElement, color: theme.text },
                ]}
                placeholder="Search people"
                placeholderTextColor={theme.textSecondary}
                value={query}
                onChangeText={setQuery}
              />
              <ThemedText type="small" themeColor="textSecondary">
                Tap to select one or more people
              </ThemedText>

              {/* only this list scrolls */}
              <FlatList
                data={visible}
                keyExtractor={(r) => String(r.id)}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                extraData={selected}
                renderItem={({ item }) => {
                  const on = selected.includes(item.id);
                  return (
                    <Pressable
                      onPress={() => toggle(item.id)}
                      style={[
                        styles.row,
                        {
                          backgroundColor: theme.backgroundElement,
                          borderColor: on ? theme.accent : 'transparent',
                        },
                      ]}>
                      <Avatar id={item.id} name={item.name} size={36} />
                      <ThemedText type="smallBold" style={styles.flex}>
                        {item.name}
                      </ThemedText>
                      {on ? <ThemedText style={{ color: theme.accent }}>✓</ThemedText> : null}
                    </Pressable>
                  );
                }}
              />
            </>
          )}

          {/* pinned footer */}
          <Button
            title={selected.length > 1 ? `Save (${selected.length})` : 'Save'}
            size="lg"
            fullWidth
            loading={saving}
            disabled={selected.length === 0}
            onPress={() => save(close)}
          />
        </>
      )}
    </AppSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 999 },
  search: { height: 48, borderRadius: 16, paddingHorizontal: Spacing.three, fontSize: 16 },
  list: { flex: 1 },
  listContent: { gap: Spacing.two },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: 16,
    borderWidth: 2,
  },
});
