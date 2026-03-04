import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import type { FlowerSvgProps } from './types';

// Wide ruffled petal — broader than rose, with wavy edges via extra control points
const OUTER = 'M50 48 C40 38,24 20,32 8 C36 0,48 -2,50 4 C52 -2,64 0,68 8 C76 20,60 38,50 48Z';
// Medium ruffled layer
const MID = 'M50 48 C42 40,30 24,36 14 C40 6,48 2,50 6 C52 2,60 6,64 14 C70 24,58 40,50 48Z';
// Inner layer
const INNER = 'M50 48 C44 42,36 30,40 20 C42 14,49 10,50 14 C51 10,58 14,60 20 C64 30,56 42,50 48Z';

const ANGLES_6 = [0, 60, 120, 180, 240, 300];
const ANGLES_6_OFF = [30, 90, 150, 210, 270, 330];

export function PeonyFlower({ color1, color2, color3, center, width, height, opacity = 1 }: FlowerSvgProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 100 100" opacity={opacity}>
      {/* Outer ruffled layer — 6 wide petals */}
      {ANGLES_6.map((a, i) => (
        <Path key={`o${i}`} d={OUTER} transform={`rotate(${a} 50 50)`}
          fill={i % 2 === 0 ? color3 : color2} opacity={0.7} />
      ))}
      {/* Middle layer — 6 petals offset 30° */}
      {ANGLES_6_OFF.map((a, i) => (
        <Path key={`m${i}`} d={MID} transform={`rotate(${a} 50 50)`}
          fill={i % 2 === 0 ? color2 : color1} opacity={0.8} />
      ))}
      {/* Inner ruffled petals — 6 */}
      {ANGLES_6.map((a, i) => (
        <Path key={`i${i}`} d={INNER} transform={`rotate(${a} 50 50)`}
          fill={color1} opacity={0.85} />
      ))}
      {/* Lush center */}
      <Circle cx={50} cy={50} r={8} fill={color1} opacity={0.9} />
      <Circle cx={50} cy={50} r={5} fill={center} />
      <Circle cx={47} cy={48} r={1.5} fill={color3} opacity={0.8} />
      <Circle cx={53} cy={48} r={1.5} fill={color3} opacity={0.75} />
      <Circle cx={50} cy={53} r={1.3} fill={color3} opacity={0.7} />
      <Circle cx={46} cy={52} r={1} fill={color3} opacity={0.6} />
      <Circle cx={54} cy={52} r={1} fill={color3} opacity={0.6} />
    </Svg>
  );
}
