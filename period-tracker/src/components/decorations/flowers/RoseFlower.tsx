import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import type { FlowerSvgProps } from './types';

// Wide rounded petal - smooth bezier with gentle tip
const OUTER = 'M50 48 C42 40,30 24,36 12 C38 4,48 0,50 4 C52 0,62 4,64 12 C70 24,58 40,50 48Z';
// Narrower middle petal
const MID = 'M50 48 C44 42,36 30,40 20 C42 14,49 10,50 13 C51 10,58 14,60 20 C64 30,56 42,50 48Z';
// Small tight inner petal
const INNER = 'M50 48 C46 44,40 36,43 28 C45 22,49 18,50 21 C51 18,55 22,57 28 C60 36,54 44,50 48Z';

const OUTER_ANGLES = [0, 72, 144, 216, 288];
const MID_ANGLES = [36, 108, 180, 252, 324];
const INNER_ANGLES = [18, 90, 162, 234, 306];

export function RoseFlower({ color1, color2, color3, center, width, height, opacity = 1 }: FlowerSvgProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 100 100" opacity={opacity}>
      {OUTER_ANGLES.map((a, i) => (
        <Path key={`o${i}`} d={OUTER} transform={`rotate(${a} 50 50)`}
          fill={i % 2 === 0 ? color3 : color2} opacity={0.75} />
      ))}
      {MID_ANGLES.map((a, i) => (
        <Path key={`m${i}`} d={MID} transform={`rotate(${a} 50 50)`}
          fill={i % 2 === 0 ? color2 : color1} opacity={0.85} />
      ))}
      {INNER_ANGLES.map((a, i) => (
        <Path key={`i${i}`} d={INNER} transform={`rotate(${a} 50 50)`}
          fill={color1} opacity={0.9} />
      ))}
      <Circle cx={50} cy={50} r={6} fill={center} />
      <Circle cx={48} cy={48} r={1.5} fill={color3} opacity={0.8} />
      <Circle cx={52} cy={48} r={1.5} fill={color3} opacity={0.8} />
      <Circle cx={50} cy={52} r={1.2} fill={color3} opacity={0.7} />
    </Svg>
  );
}
