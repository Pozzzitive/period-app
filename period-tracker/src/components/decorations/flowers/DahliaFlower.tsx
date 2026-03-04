import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import type { FlowerSvgProps } from './types';

// Narrow pointed dahlia petal
const OUTER = 'M50 48 C47 42,42 28,44 14 C45 6,50 2,50 6 C50 2,55 6,56 14 C58 28,53 42,50 48Z';
// Shorter middle petal
const MID = 'M50 48 C47 44,44 34,45 24 C46 18,50 14,50 17 C50 14,54 18,55 24 C56 34,53 44,50 48Z';
// Tiny inner petal
const INNER = 'M50 48 C48 44,46 38,47 32 C48 28,50 26,50 28 C50 26,52 28,53 32 C54 38,52 44,50 48Z';

const ANGLES_12 = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
const ANGLES_12_OFF = [15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345];

export function DahliaFlower({ color1, color2, color3, center, width, height, opacity = 1 }: FlowerSvgProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 100 100" opacity={opacity}>
      {/* Outer ring — 12 petals */}
      {ANGLES_12.map((a, i) => (
        <Path key={`o${i}`} d={OUTER} transform={`rotate(${a} 50 50)`}
          fill={i % 3 === 0 ? color3 : i % 3 === 1 ? color2 : color3} opacity={0.7} />
      ))}
      {/* Middle ring — 12 petals offset 15° */}
      {ANGLES_12_OFF.map((a, i) => (
        <Path key={`m${i}`} d={MID} transform={`rotate(${a} 50 50)`}
          fill={i % 2 === 0 ? color1 : color2} opacity={0.8} />
      ))}
      {/* Inner ring — 12 tiny petals */}
      {ANGLES_12.map((a, i) => (
        <Path key={`i${i}`} d={INNER} transform={`rotate(${a} 50 50)`}
          fill={color1} opacity={0.85} />
      ))}
      {/* Center dome */}
      <Circle cx={50} cy={50} r={7} fill={color1} opacity={0.9} />
      <Circle cx={50} cy={50} r={4} fill={center} />
      <Circle cx={48} cy={49} r={1.2} fill={color3} opacity={0.7} />
      <Circle cx={52} cy={49} r={1.2} fill={color3} opacity={0.7} />
      <Circle cx={50} cy={52} r={1} fill={color3} opacity={0.6} />
    </Svg>
  );
}
