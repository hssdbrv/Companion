import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Avatar } from '@/features/relatives/avatar';
import { ageOf } from '@/features/relatives/format';
import { formatAmount } from '@/features/wedding-gifts/format';
import { RelationPicker } from '@/features/relatives/relation-picker';
import { RelativeForm } from '@/features/relatives/relative-form';
import { type Relative, useRelatives } from '@/features/relatives/use-relatives';

type Item = { relationId: number; person: Relative };

const SECTIONS = [
  ['parents', 'Parents'],
  ['spouse', 'Spouse'],
  ['children', 'Children'],
  ['siblings', 'Siblings'],
  ['cousins', 'Cousins'],
] as const;

export default function RelativeDetail() {
  const theme = useTheme();
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const id = Number(idParam);
  const {
    relatives,
    relations,
    wedding,
    loaded,
    updateRelative,
    removeRelative,
    addRelation,
    removeRelation,
  } = useRelatives();
  const [editing, setEditing] = useState(false);
  const [picking, setPicking] = useState(false);

  const person = relatives.find((r) => r.id === id);
  if (!person) {
    return (
      <ThemedView style={styles.flex}>
        <Stack.Screen options={{ title: loaded ? 'Not found' : '' }} />
      </ThemedView>
    );
  }

  const byId = new Map(relatives.map((r) => [r.id, r]));
  const groups: Record<(typeof SECTIONS)[number][0], Item[]> = {
    parents: [],
    spouse: [],
    children: [],
    siblings: [],
    cousins: [],
  };
  for (const rel of relations) {
    if (rel.a_id !== id && rel.b_id !== id) continue;
    const other = byId.get(rel.a_id === id ? rel.b_id : rel.a_id);
    if (!other) continue;
    const item = { relationId: rel.id, person: other };
    if (rel.type === 'parent') (rel.a_id === id ? groups.children : groups.parents).push(item);
    else if (rel.type === 'spouse') groups.spouse.push(item);
    else if (rel.type === 'sibling') groups.siblings.push(item);
    else groups.cousins.push(item);
  }
  const hasRelations = SECTIONS.some(([key]) => groups[key].length > 0);

  const age = person.deceased ? null : ageOf(person.birth_year);
  const gift = wedding[person.id];
  const info: [string, string][] = [
    ['Age', age !== null ? String(age) : '—'],
    ['Born', person.birth_year ? String(person.birth_year) : 'Unknown'],
    ['Status', person.deceased ? 'Passed away' : 'Alive'],
    ['Wedding', gift ? (gift.attended ? 'Attended' : 'Did not attend') : 'No record yet'],
  ];
  if (gift) info.push(['Gift', `${formatAmount(gift.amount)} Toman`]);

  const open = (otherId: number) =>
    router.push({ pathname: '/modules/relatives/[id]', params: { id: String(otherId) } });

  const confirmRemoveRelation = (item: Item) =>
    Alert.alert('Remove relationship', `Unlink ${item.person.name} and ${person.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeRelation(item.relationId) },
    ]);

  const confirmDelete = () =>
    Alert.alert(
      'Delete person',
      `Delete ${person.name} and all their relationships? Their wedding gift record, if any, stays as a regular guest.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeRelative(person.id);
            router.back();
          },
        },
      ],
    );

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen
        options={{
          title: person.name,
          headerRight: () => (
            <Pressable onPress={() => setEditing(true)} hitSlop={12}>
              <ThemedText type="smallBold">Edit</ThemedText>
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Avatar id={person.id} name={person.name} size={84} />
          <ThemedText type="subtitle" style={styles.name}>
            {person.name}
          </ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          {info.map(([label, value]) => (
            <View key={label} style={styles.infoRow}>
              <ThemedText themeColor="textSecondary">{label}</ThemedText>
              <ThemedText type="smallBold">{value}</ThemedText>
            </View>
          ))}
        </View>

        <ThemedText type="smallBold" themeColor="textSecondary">
          RELATIONSHIPS
        </ThemedText>

        {!hasRelations && (
          <ThemedText themeColor="textSecondary">No relationships yet.</ThemedText>
        )}

        {SECTIONS.map(([key, title]) =>
          groups[key].length ? (
            <View key={key} style={styles.section}>
              <ThemedText type="small" themeColor="textSecondary">
                {title}
              </ThemedText>
              {groups[key].map((item) => (
                <Pressable
                  key={item.relationId}
                  onPress={() => open(item.person.id)}
                  style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
                  <Avatar id={item.person.id} name={item.person.name} size={36} />
                  <ThemedText type="smallBold" style={styles.flex}>
                    {item.person.name}
                  </ThemedText>
                  <Pressable onPress={() => confirmRemoveRelation(item)} hitSlop={12}>
                    <ThemedText themeColor="textSecondary">✕</ThemedText>
                  </Pressable>
                </Pressable>
              ))}
            </View>
          ) : null,
        )}

        <Button
          title="Add relationship"
          size="lg"
          fullWidth
          onPress={() => setPicking(true)}
        />

        <Pressable onPress={confirmDelete} style={styles.delete}>
          <ThemedText style={styles.deleteText}>Delete person</ThemedText>
        </Pressable>
      </ScrollView>

      {editing && (
        <RelativeForm
          initial={person}
          onSubmit={(input) => updateRelative(person.id, input)}
          onClose={() => setEditing(false)}
        />
      )}

      {picking && (
        <RelationPicker
          person={person}
          others={relatives.filter((r) => r.id !== person.id)}
          onSubmit={(option, otherId) =>
            addRelation(
              option.selfIsA ? person.id : otherId,
              option.selfIsA ? otherId : person.id,
              option.type,
            )
          }
          onClose={() => setPicking(false)}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
  hero: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.three },
  name: { textAlign: 'center' },
  card: { borderRadius: 20, padding: Spacing.three, gap: Spacing.two },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  section: { gap: Spacing.two },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 16,
  },
  delete: { alignItems: 'center', padding: Spacing.three },
  deleteText: { color: '#E5484D' },
});