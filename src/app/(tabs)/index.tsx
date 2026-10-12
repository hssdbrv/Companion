import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModuleCard } from '@/components/module-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MODULES } from '@/constants/modules';
import { BottomTabInset, Spacing } from '@/constants/theme';

export default function Home() {
  // pad odd counts so the last card keeps half width
  const data = MODULES.length % 2 ? [...MODULES, null] : MODULES;

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <FlatList
          data={data}
          numColumns={2}
          keyExtractor={(item, i) => item?.id ?? `spacer-${i}`}
          columnWrapperStyle={{ gap: Spacing.three }}
          contentContainerStyle={{
            padding: Spacing.three,
            gap: Spacing.three,
            paddingBottom: BottomTabInset + Spacing.three,
          }}
          ListHeaderComponent={
            <View style={styles.header}>
              <ThemedText type="subtitle">Companion</ThemedText>
              <ThemedText themeColor="textSecondary">Pick an activity</ThemedText>
            </View>
          }
          renderItem={({ item }) => (item ? <ModuleCard module={item} /> : <View style={styles.flex} />)}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { marginBottom: Spacing.three },
});