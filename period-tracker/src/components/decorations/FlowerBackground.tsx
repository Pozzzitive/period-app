import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/src/theme';
import { useSettingsStore } from '@/src/stores';
import { s, SCREEN_H } from '@/src/utils/scale';
import { FLOWER_MAP, FLOWER_PALETTES } from './flowers';

/**
 * 6 flowers at screen edges — they sit behind content and peek through
 * wherever the content has padding/gaps (side margins, spacing between items).
 * Render INSIDE a ScrollView so it scrolls with the page.
 */
const FLOWER_SIZE = 150;

const PLACEMENTS = [
  { key: 'tl', left: -s(50), top: -s(15), rotation: 15, hueIndex: 0 },
  { key: 'tr', right: -s(50), top: -s(15), rotation: -20, hueIndex: 1 },
  { key: 'ml', left: -s(60), top: Math.round(SCREEN_H * 0.32), rotation: -10, hueIndex: 2 },
  { key: 'mr', right: -s(60), top: Math.round(SCREEN_H * 0.48), rotation: 25, hueIndex: 3 },
  { key: 'bl', left: -s(50), top: Math.round(SCREEN_H * 1), rotation: -25, hueIndex: 2},
  { key: 'br', right: -s(50), top: Math.round(SCREEN_H * 1), rotation: 10, hueIndex: 3},
];

interface FlowerBackgroundProps {
  opacity?: number;
}

export function FlowerBackground({ opacity }: FlowerBackgroundProps) {
  const { themeId, isDark } = useTheme();
  const showFlowers = useSettingsStore((s) => s.settings.showFlowerDecorations);

  const baseOpacity = opacity ?? (isDark ? 0.50 : 0.70);
  const palette = FLOWER_PALETTES[themeId];
  const hues = isDark ? palette.dark : palette.light;
  const FlowerComponent = FLOWER_MAP[themeId];
  const size = s(FLOWER_SIZE);

  const flowers = useMemo(() => {
    return PLACEMENTS.map((p) => {
      const hue = hues[p.hueIndex % hues.length];
      const posStyle: Record<string, number> = {};
      if ('left' in p && p.left != null) posStyle.left = p.left;
      if ('right' in p && p.right != null) posStyle.right = p.right;
      if ('top' in p && p.top != null) posStyle.top = p.top;

      return (
        <View
          key={p.key}
          style={[styles.flower, posStyle, { transform: [{ rotate: `${p.rotation}deg` }] }]}
        >
          <FlowerComponent
            width={size} height={size}
            color1={hue.color1} color2={hue.color2}
            color3={hue.color3} center={hue.center}
            opacity={baseOpacity}
          />
        </View>
      );
    });
  }, [themeId, isDark, hues, baseOpacity, size, FlowerComponent]);

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
    height: SCREEN_H * 1.4,
    overflow: 'hidden',
  },
  flower: {
    position: 'absolute',
  },
});
