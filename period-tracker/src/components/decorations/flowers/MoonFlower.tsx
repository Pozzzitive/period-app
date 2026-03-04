import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import type { FlowerSvgProps } from './types';

// Long elegant trumpet petal
const TRUMPET = 'M50 48 C48 42,44 28,44 14 C44 4,50 -2,50 4 C50 -2,56 4,56 14 C56 28,52 42,50 48Z';
// Wider mid-layer petal
const MID = 'M50 48 C46 40,38 22,42 10 C44 2,50 -2,50 4 C50 -2,56 2,58 10 C62 22,54 40,50 48Z';

const ANGLES_5 = [0, 72, 144, 216, 288];
const ANGLES_5_OFF = [36, 108, 180, 252, 324];

// Star positions (scattered around edges)
const STARS = [
  { cx: 12, cy: 8, r: 2 }, { cx: 88, cy: 6, r: 1.5 },
  { cx: 95, cy: 50, r: 1.8 }, { cx: 5, cy: 54, r: 1.5 },
  { cx: 24, cy: 92, r: 2 }, { cx: 76, cy: 90, r: 1.5 },
  { cx: 8, cy: 34, r: 1.2 }, { cx: 92, cy: 70, r: 1.3 },
];

export function MoonFlower({ color1, color2, color3, center, width, height, opacity = 1 }: FlowerSvgProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 100 100" opacity={opacity}>
      {/* Outer trumpet petals */}
      {ANGLES_5.map((a, i) => (
        <Path key={`o${i}`} d={MID} transform={`rotate(${a} 50 50)`}
          fill={i % 2 === 0 ? color3 : color2} opacity={0.7} />
      ))}
      {/* Inner trumpet petals offset */}
      {ANGLES_5_OFF.map((a, i) => (
        <Path key={`i${i}`} d={TRUMPET} transform={`rotate(${a} 50 50)`}
          fill={i % 2 === 0 ? color1 : color2} opacity={0.85} />
      ))}
      {/* Center glow */}
      <Circle cx={50} cy={50} r={10} fill={color2} opacity={0.9} />
      <Circle cx={50} cy={50} r={6} fill={center} />
      <Circle cx={48} cy={48} r={1.5} fill={color3} opacity={0.8} />
      <Circle cx={52} cy={49} r={1.2} fill={color3} opacity={0.7} />
      {/* Star scatter */}
      {STARS.map((s, i) => (
        <Circle key={`s${i}`} cx={s.cx} cy={s.cy} r={s.r}
          fill={i % 2 === 0 ? color3 : color2} opacity={0.6 + (i % 3) * 0.1} />
      ))}
    </Svg>
  );
}
