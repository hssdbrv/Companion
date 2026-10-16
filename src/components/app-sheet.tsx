import { BottomSheet, RNHostView } from '@expo/ui';
import { type ReactNode, useEffect, useState } from 'react';
import { Keyboard, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// roughly how long the native sheet takes to slide away
const HIDE_MS = 300;
// drag indicator + sheet chrome above the content
const SHEET_CHROME = 56;

type Props = {
  /** called after the sheet has closed, so the parent can unmount it */
  onClose: () => void;
  /** receives `close`, which slides the sheet away and then calls `onClose` */
  children: (close: () => void) => ReactNode;
};

function useKeyboardHeight() {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setHeight(e.endCoordinates.height),
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setHeight(0),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return height;
}

/** Native bottom sheet (Expo UI) that hosts regular React Native content. */
export function AppSheet({ onClose, children }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const keyboardHeight = useKeyboardHeight();
  const [presented, setPresented] = useState(true);

  const close = () => {
    setPresented(false);
    setTimeout(onClose, HIDE_MS);
  };

  // Explicit height: the native sheet does not give the React Native content a
  // measured size, so a flex:1 ScrollView can end up taller than the visible
  // sheet and its bottom (the Save button) is never reachable.
  const contentHeight = windowHeight - insets.top - SHEET_CHROME;

  return (
    <BottomSheet
      isPresented={presented}
      onDismiss={close}
      snapPoints={['half']}
      containerColor={theme.background}>
      <RNHostView>
        <View
          style={[
            styles.content,
            {
              height: contentHeight,
              // keep the pinned Save button above the keyboard / system bar
              paddingBottom: keyboardHeight > 0 ? keyboardHeight : insets.bottom + Spacing.three,
            },
          ]}>
          {children(close)}
        </View>
      </RNHostView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.three },
});
