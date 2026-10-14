import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, Share, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatAmount, guestsToCsv } from '@/features/wedding-gifts/format';
import { GuestForm } from '@/features/wedding-gifts/guest-form';
import { type Guest, useGuests } from '@/features/wedding-gifts/use-guests';

export default function WeddingGifts() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { guests, relatives, total, add, update, remove } = useGuests();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'yes' | 'no'>('all');

  const q = query.trim().toLowerCase();
  const visible = guests.filter(
    (g) =>
      (filter === 'all' || (filter === 'yes') === !!g.attended) &&
      (!q || g.name.toLowerCase().includes(q)),
  );
  const attendedCount = guests.filter((g) => g.attended).length;

  // relatives already linked to a gift record, except the one being edited
  const linked = new Set(
    guests.map((g) => g.relative_id).filter((x): x is number => x !== null),
  );
  const available = relatives.filter(
    (r) => !linked.has(r.id) || r.id === editing?.relative_id,
  );

  const openForm = (guest: Guest | null) => {
    setEditing(guest);
    setFormOpen(true);
  };

  const exportCsv = () => {
    if (guests.length) Share.share({ message: guestsToCsv(guests) });
  };

  const confirmDelete = (g: Guest) =>
    Alert.alert('Delete gift', `Remove ${g.name}'s gift record?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(g.id) },
    ]);

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen
        options={{
          title: 'Wedding gifts',
          headerRight: () => (
            <Pressable onPress={exportCsv} hitSlop={12}>
              <ThemedText type="smallBold">Export</ThemedText>
            </Pressable>
          ),
        }}
      />

      <FlatList
        data={visible}
        keyExtractor={(g) => String(g.id)}
        contentContainerStyle={{ padding: Spacing.three, gap: Spacing.two, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={[styles.summary, { backgroundColor: theme.accent }]}>
              <ThemedText type="small" style={{ color: theme.onAccent, opacity: 0.8 }}>
                Total gifts · {attendedCount}/{guests.length} attended
              </ThemedText>
              <ThemedText type="subtitle" style={{ color: theme.onAccent }}>
                {formatAmount(total)} Toman
              </ThemedText>
            </View>
            <TextInput
              style={[styles.search, { backgroundColor: theme.backgroundElement, color: theme.text }]}
              placeholder="Search guests"
              placeholderTextColor={theme.textSecondary}
              value={query}
              onChangeText={setQuery}
            />
            <View style={styles.chips}>
              {(['all', 'yes', 'no'] as const).map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  style={[
                    styles.chip,
                    { backgroundColor: filter === f ? theme.accent : theme.backgroundElement },
                  ]}>
                  <ThemedText
                    type="small"
                    style={{ color: filter === f ? theme.onAccent : theme.text }}>
                    {f === 'all' ? 'All' : f === 'yes' ? 'Attended' : 'Absent'}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            {q || filter !== 'all' ? 'No match' : 'No gifts yet. Tap "Add gift" below.'}
          </ThemedText>
        }
        renderItem={({ item }) => {
          const sub = [
            item.relative_id !== null && 'Relative',
            !item.attended && 'Did not attend',
            item.note,
          ]
            .filter(Boolean)
            .join(' · ');
          return (
            <Pressable
              onPress={() => openForm(item)}
              onLongPress={() => confirmDelete(item)}
              style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
              <View style={styles.flex}>
                <ThemedText type="smallBold">{item.name}</ThemedText>
                {sub ? (
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                    {sub}
                  </ThemedText>
                ) : null}
              </View>
              <ThemedText type="smallBold">{formatAmount(item.amount)}</ThemedText>
            </Pressable>
          );
        }}
      />

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + Spacing.three, backgroundColor: theme.background },
        ]}>
        <Button title="Add gift" size="lg" fullWidth onPress={() => openForm(null)} />
      </View>

      {formOpen && (
        <GuestForm
          initial={editing}
          relatives={available}
          onSubmit={(input) => (editing ? update(editing.id, input) : add(input))}
          onClose={() => setFormOpen(false)}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { gap: Spacing.three, marginBottom: Spacing.two },
  summary: { borderRadius: 24, padding: Spacing.four, gap: Spacing.one },
  search: { height: 48, borderRadius: 16, paddingHorizontal: Spacing.three, fontSize: 16 },
  chips: { flexDirection: 'row', gap: Spacing.two },
  chip: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 999 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 18,
  },
  empty: { textAlign: 'center', marginTop: Spacing.five },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: Spacing.three },
});