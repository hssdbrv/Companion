import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import type { AppModule } from '@/constants/modules';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ModuleCard({ module }: { module: AppModule }) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={module.title}
      onPress={() => router.push(module.href)}
      onPressIn={() => (scale.value = withSpring(0.96, { damping: 15, stiffness: 300 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 12, stiffness: 250 }))}
      style={[styles.card, { backgroundColor: theme.backgroundElement }, animatedStyle]}>
      <View style={[styles.iconWrap, { backgroundColor: module.tint + '26' }]}>
        <Text style={styles.emoji}>{module.emoji}</Text>
      </View>
      <View style={styles.text}>
        <ThemedText type="smallBold">{module.title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
          {module.subtitle}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 150,
    borderRadius: 24,
    padding: Spacing.three,
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 24 },
  text: { gap: Spacing.half },
});