import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatAmount } from '@/features/wedding-gifts/format';
import { GuestForm } from '@/features/wedding-gifts/guest-form';
import { type Guest, useGuests } from '@/features/wedding-gifts/use-guests';

export default function WeddingGifts() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { guests, total, add, update, remove } = useGuests();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const visible = q ? guests.filter((g) => g.name.toLowerCase().includes(q)) : guests;

  const openForm = (guest: Guest | null) => {
    setEditing(guest);
    setFormOpen(true);
  };

  const confirmDelete = (g: Guest) =>
    Alert.alert('Delete guest', `Remove ${g.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(g.id) },
    ]);

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ title: 'Wedding gifts' }} />

      <FlatList
        data={visible}
        keyExtractor={(g) => String(g.id)}
        contentContainerStyle={{ padding: Spacing.three, gap: Spacing.two, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={[styles.summary, { backgroundColor: theme.accent }]}>
              <ThemedText type="small" style={{ color: theme.onAccent, opacity: 0.8 }}>
                Total gifts · {guests.length} guests
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
          </View>
        }
        ListEmptyComponent={
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            {q ? 'No match' : 'No guests yet. Tap "Add guest" below.'}
          </ThemedText>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openForm(item)}
            onLongPress={() => confirmDelete(item)}
            style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.flex}>
              <ThemedText type="smallBold">{item.name}</ThemedText>
              {item.note ? (
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                  {item.note}
                </ThemedText>
              ) : null}
            </View>
            <ThemedText type="smallBold">{formatAmount(item.amount)}</ThemedText>
          </Pressable>
        )}
      />

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + Spacing.three, backgroundColor: theme.background },
        ]}>
        <Button title="Add guest" size="lg" fullWidth onPress={() => openForm(null)} />
      </View>

      {formOpen && (
        <GuestForm
          initial={editing}
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