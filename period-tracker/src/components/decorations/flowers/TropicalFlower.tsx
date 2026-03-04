import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import type { FlowerSvgProps } from './types';

// Large wide hibiscus petal
const PETAL = 'M50 48 C44 38,30 16,38 4 C42 -4,50 -6,50 0 C50 -6,58 -4,62 4 C70 16,56 38,50 48Z';
// Petal center vein
const VEIN = 'M50 46 C49 36,48 20,50 6 C52 20,51 36,50 46';

const ANGLES = [0, 72, 144, 216, 288];

// Stamen dots arranged in ring around center
const STAMENS = [
  { cx: 50, cy: 38 }, { cx: 58, cy: 42 }, { cx: 57, cy: 52 },
  { cx: 50, cy: 56 }, { cx: 43, cy: 52 }, { cx: 42, cy: 42 },
];

export function TropicalFlower({ color1, color2, color3, center, width, height, opacity = 1 }: FlowerSvgProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 100 100" opacity={opacity}>
      {/* 5 large petals */}
      {ANGLES.map((a, i) => (
        <Path key={`p${i}`} d={PETAL} transform={`rotate(${a} 50 50)`}
          fill={i % 2 === 0 ? color3 : color2} opacity={0.8} />
      ))}
      {/* Petal vein highlights */}
      {ANGLES.map((a, i) => (
        <Path key={`v${i}`} d={VEIN} transform={`rotate(${a} 50 50)`}
          fill="none" stroke={color1} strokeWidth={1} opacity={0.4} />
      ))}
      {/* Inner petal glow */}
      {ANGLES.map((a, i) => (
        <Path key={`g${i}`} d="M50 48 C46 40,40 24,44 14 C46 8,50 4,50 8 C50 4,54 8,56 14 C60 24,54 40,50 48Z"
          transform={`rotate(${a} 50 50)`}
          fill={color1} opacity={0.3} />
      ))}
      {/* Center pistil column */}
      <Circle cx={50} cy={50} r={10} fill={color1} opacity={0.9} />
      <Circle cx={50} cy={50} r={6} fill={center} />
      {/* Stamen dots */}
      {STAMENS.map((s, i) => (
        <Circle key={`s${i}`} cx={s.cx} cy={s.cy} r={2} fill={color3} opacity={0.85} />
      ))}
    </Svg>
  );
}
