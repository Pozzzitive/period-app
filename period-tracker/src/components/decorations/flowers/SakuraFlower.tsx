import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import type { FlowerSvgProps } from './types';

// Heart-shaped petal with V-notch at tip — classic sakura
const PETAL = 'M50 48 C42 38,28 20,34 10 C38 2,46 0,48 6 L50 12 L52 6 C54 0,62 2,66 10 C72 20,58 38,50 48Z';
// Smaller inner petal highlight
const INNER = 'M50 48 C44 40,36 26,40 16 C42 10,49 6,50 10 C51 6,58 10,60 16 C64 26,56 40,50 48Z';

const ANGLES = [0, 72, 144, 216, 288];
const ANGLES_OFF = [36, 108, 180, 252, 324];

// Scattered falling petals
const FALLING = [
  { d: 'M84 82 C82 78,86 74,88 78 C90 82,86 86,84 82Z', o: 0.55 },
  { d: 'M16 86 C14 82,18 78,20 82 C22 86,18 90,16 86Z', o: 0.45 },
  { d: 'M90 16 C88 12,92 8,94 12 C96 16,92 20,90 16Z', o: 0.35 },
  { d: 'M8 20 C6 16,10 12,12 16 C14 20,10 24,8 20Z', o: 0.3 },
];

export function SakuraFlower({ color1, color2, color3, center, width, height, opacity = 1 }: FlowerSvgProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 100 100" opacity={opacity}>
      {/* Main 5 heart petals */}
      {ANGLES.map((a, i) => (
        <Path key={`p${i}`} d={PETAL} transform={`rotate(${a} 50 50)`}
          fill={i % 2 === 0 ? color3 : color2} opacity={0.8} />
      ))}
      {/* Inner petal highlights */}
      {ANGLES_OFF.map((a, i) => (
        <Path key={`h${i}`} d={INNER} transform={`rotate(${a} 50 50)`}
          fill={color1} opacity={0.4} />
      ))}
      {/* Center */}
      <Circle cx={50} cy={50} r={7} fill={color2} opacity={0.9} />
      <Circle cx={50} cy={50} r={4} fill={center} />
      <Circle cx={48} cy={48} r={1.5} fill={color3} opacity={0.8} />
      <Circle cx={52} cy={48} r={1.5} fill={color3} opacity={0.7} />
      <Circle cx={50} cy={52} r={1.2} fill={color3} opacity={0.75} />
      {/* Falling petals */}
      {FALLING.map((f, i) => (
        <Path key={`f${i}`} d={f.d} fill={i % 2 === 0 ? color3 : color2} opacity={f.o} />
      ))}
    </Svg>
  );
}
