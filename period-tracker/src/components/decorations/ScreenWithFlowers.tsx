import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, themeToVars } from '../../theme';

interface ScreenWithFlowersProps {
  backgroundColor: string;
  children: React.ReactNode;
}

/** Simple background wrapper. Applies NativeWind CSS-variable overrides so
 *  Tailwind utility classes like `bg-surface` pick up the active theme. */
export function ScreenWithFlowers({ backgroundColor, children }: ScreenWithFlowersProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor }, themeToVars(colors) as any]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
