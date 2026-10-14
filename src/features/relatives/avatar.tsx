import { StyleSheet, Text, View } from 'react-native';

const PALETTE = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#EF4444'];

export function Avatar({ id, name, size = 44 }: { id: number; name: string; size?: number }) {
  const letter = [...name.trim()][0] ?? '?';
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: PALETTE[id % PALETTE.length],
        },
      ]}>
      <Text style={[styles.letter, { fontSize: size * 0.42 }]}>{letter.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  letter: { color: '#ffffff', fontWeight: '700' },
});