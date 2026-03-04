import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ScreenWithFlowersProps {
  backgroundColor: string;
  children: React.ReactNode;
}

/** Simple background wrapper. Flowers are placed inside each screen's content. */
export function ScreenWithFlowers({ backgroundColor, children }: ScreenWithFlowersProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
