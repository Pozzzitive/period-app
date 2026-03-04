import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import type { FlowerSvgProps } from './types';

// Elegant stroke-only petal outline
const PETAL_STROKE = 'M50 46 C44 38,34 22,40 10 C44 2,50 0,50 4 C50 0,56 2,60 10 C66 22,56 38,50 46';
// Subtle fill for slight coloring
const PETAL_FILL = 'M50 46 C44 38,34 22,40 10 C44 2,50 0,50 4 C50 0,56 2,60 10 C66 22,56 38,50 46Z';

const ANGLES = [0, 72, 144, 216, 288];

export function NoirBotanical({ color1, color2, color3, center, width, height, opacity = 1 }: FlowerSvgProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 100 100" opacity={opacity}>
      {/* Subtle petal fills */}
      {ANGLES.map((a, i) => (
        <Path key={`f${i}`} d={PETAL_FILL} transform={`rotate(${a} 50 50)`}
          fill={i % 2 === 0 ? color2 : color3} opacity={0.15} />
      ))}
      {/* Petal outlines — clean line art */}
      {ANGLES.map((a, i) => (
        <Path key={`s${i}`} d={PETAL_STROKE} transform={`rotate(${a} 50 50)`}
          fill="none" stroke={i % 2 === 0 ? color1 : color2} strokeWidth={1.2} opacity={0.7} />
      ))}
      {/* Center vein lines */}
      {ANGLES.map((a, i) => (
        <Path key={`v${i}`} d="M50 44 C49 34,49 20,50 8"
          transform={`rotate(${a} 50 50)`}
          fill="none" stroke={center} strokeWidth={0.6} opacity={0.35} />
      ))}
      {/* Center ring */}
      <Circle cx={50} cy={50} r={6} fill="none" stroke={color1} strokeWidth={1.2} opacity={0.8} />
      <Circle cx={50} cy={50} r={3} fill="none" stroke={color2} strokeWidth={0.8} opacity={0.6} />
      <Circle cx={50} cy={50} r={1.5} fill={color1} opacity={0.5} />
      {/* Decorative dots */}
      <Circle cx={50} cy={38} r={1.5} fill="none" stroke={color2} strokeWidth={0.8} opacity={0.5} />
      <Circle cx={58} cy={42} r={1.2} fill="none" stroke={color3} strokeWidth={0.8} opacity={0.4} />
      <Circle cx={42} cy={42} r={1.2} fill="none" stroke={color3} strokeWidth={0.8} opacity={0.4} />
    </Svg>
  );
}
