import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/src/theme';
import { useSettingsStore } from '@/src/stores';
import { s, SCREEN_H } from '@/src/utils/scale';
import { FLOWER_MAP, FLOWER_PALETTES } from './flowers';

/**
 * 2 flowers at opposite corners.
 * Render this INSIDE a ScrollView so it scrolls with the page.
 * Uses absolute positioning so it doesn't affect content layout.
 */
const FLOWER_SIZE = 130;

interface CornerFlowersProps {
  opacity?: number;
}

export function CornerFlowers({ opacity }: CornerFlowersProps) {
  const { themeId, isDark } = useTheme();
  const showFlowers = useSettingsStore((s) => s.settings.showFlowerDecorations);

  const baseOpacity = opacity ?? (isDark ? 0.40 : 0.55);
  const palette = FLOWER_PALETTES[themeId];
  const hues = isDark ? palette.dark : palette.light;
  const FlowerComponent = FLOWER_MAP[themeId];
  const size = s(FLOWER_SIZE);

  const flowers = useMemo(() => (
    <>
      <View style={[styles.flower, styles.topRight]}>
        <View style={{ transform: [{ rotate: '25deg' }] }}>
          <FlowerComponent
            width={size} height={size}
            color1={hues[0].color1} color2={hues[0].color2}
            color3={hues[0].color3} center={hues[0].center}
            opacity={baseOpacity}
          />
        </View>
      </View>
      <View style={[styles.flower, styles.bottomLeft]}>
        <View style={{ transform: [{ rotate: '-20deg' }] }}>
          <FlowerComponent
            width={size} height={size}
            color1={hues[1 % hues.length].color1} color2={hues[1 % hues.length].color2}
            color3={hues[1 % hues.length].color3} center={hues[1 % hues.length].center}
            opacity={baseOpacity}
          />
        </View>
      </View>
    </>
  ), [themeId, isDark, hues, baseOpacity, size, FlowerComponent]);

  if (!showFlowers) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {flowers}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_H,
    overflow: 'hidden',
  },
  flower: {
    position: 'absolute',
  },
  topRight: {
    top: -s(25),
    right: -s(35),
  },
  bottomLeft: {
    bottom: -s(25),
    left: -s(35),
  },
});
