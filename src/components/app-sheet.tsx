import { BottomSheet, RNHostView } from '@expo/ui';
import { type ReactNode, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// roughly how long the native sheet takes to slide away
const HIDE_MS = 300;

type Props = {
  /** called after the sheet has closed, so the parent can unmount it */
  onClose: () => void;
  /** receives `close`, which slides the sheet away and then calls `onClose` */
  children: (close: () => void) => ReactNode;
};

/** Native bottom sheet (Expo UI) that hosts regular React Native content. */
export function AppSheet({ onClose, children }: Props) {
  const theme = useTheme();
  const [presented, setPresented] = useState(true);

  const close = () => {
    setPresented(false);
    setTimeout(onClose, HIDE_MS);
  };

  return (
    <BottomSheet
      isPresented={presented}
      onDismiss={close}
      snapPoints={['half']}
      containerColor={theme.background}>
      <RNHostView>
        <View style={styles.content}>{children(close)}</View>
      </RNHostView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, gap: Spacing.three },
});