import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Avatar } from '@/features/relatives/avatar';
import { subtitleOf } from '@/features/relatives/format';
import { RelativeForm } from '@/features/relatives/relative-form';
import { useRelatives } from '@/features/relatives/use-relatives';

export default function Relatives() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { relatives, wedding, addRelative } = useRelatives();
  const [formOpen, setFormOpen] = useState(false);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const visible = q ? relatives.filter((r) => r.name.toLowerCase().includes(q)) : relatives;
  const attendedCount = relatives.filter((r) => wedding[r.id]?.attended).length;

  const open = (id: number) =>
    router.push({ pathname: '/modules/relatives/[id]', params: { id: String(id) } });

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ title: 'Relatives' }} />

      <FlatList
        data={visible}
        keyExtractor={(r) => String(r.id)}
        contentContainerStyle={{ padding: Spacing.three, gap: Spacing.two, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={[styles.summary, { backgroundColor: theme.accent }]}>
              <ThemedText type="small" style={{ color: theme.onAccent, opacity: 0.8 }}>
                Family members
              </ThemedText>
              <ThemedText type="subtitle" style={{ color: theme.onAccent }}>
                {relatives.length}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.onAccent, opacity: 0.8 }}>
                {attendedCount} attended the wedding
              </ThemedText>
            </View>
            <TextInput
              style={[styles.search, { backgroundColor: theme.backgroundElement, color: theme.text }]}
              placeholder="Search relatives"
              placeholderTextColor={theme.textSecondary}
              value={query}
              onChangeText={setQuery}
            />
          </View>
        }
        ListEmptyComponent={
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            {q ? 'No match' : 'No relatives yet. Tap "Add relative" below.'}
          </ThemedText>
        }
        renderItem={({ item }) => {
          const subtitle = subtitleOf(item);
          return (
            <Pressable
              onPress={() => open(item.id)}
              style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
              <Avatar id={item.id} name={item.name} />
              <View style={styles.flex}>
                <ThemedText type="smallBold">{item.name}</ThemedText>
                {subtitle ? (
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                    {subtitle}
                  </ThemedText>
                ) : null}
              </View>
              {wedding[item.id]?.attended ? (
                <ThemedText type="small" style={{ color: theme.accent }}>
                  Wedding ✓
                </ThemedText>
              ) : null}
            </Pressable>
          );
        }}
      />

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + Spacing.three, backgroundColor: theme.background },
        ]}>
        <Button title="Add relative" size="lg" fullWidth onPress={() => setFormOpen(true)} />
      </View>

      {formOpen && (
        <RelativeForm onSubmit={addRelative} onClose={() => setFormOpen(false)} />
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