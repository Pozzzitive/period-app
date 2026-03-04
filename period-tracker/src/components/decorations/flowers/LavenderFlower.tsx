import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import type { FlowerSvgProps } from './types';

// Teardrop bud shape
const BUD_L = (y: number) =>
  `M46 ${y} C40 ${y - 6},38 ${y - 14},44 ${y - 18} C48 ${y - 14},48 ${y - 6},46 ${y}Z`;
const BUD_R = (y: number) =>
  `M54 ${y} C60 ${y - 6},62 ${y - 14},56 ${y - 18} C52 ${y - 14},52 ${y - 6},54 ${y}Z`;

export function LavenderFlower({ color1, color2, color3, center, width, height, opacity = 1 }: FlowerSvgProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 100 100" opacity={opacity}>
      {/* Main stem */}
      <Path d="M50 96 C49 84,48 70,49 58 C50 46,50 34,50 20"
        fill="none" stroke={center} strokeWidth={2.5} strokeLinecap="round" />
      {/* Left branch */}
      <Path d="M49 70 C42 62,30 56,22 52"
        fill="none" stroke={center} strokeWidth={2} strokeLinecap="round" />
      {/* Right branch */}
      <Path d="M50 58 C58 50,68 44,76 40"
        fill="none" stroke={center} strokeWidth={2} strokeLinecap="round" />
      {/* Leaves */}
      <Path d="M46 82 C38 80,34 84,38 88 C42 86,46 84,46 82Z" fill={center} opacity={0.5} />
      <Path d="M54 78 C62 76,66 80,62 84 C58 82,54 80,54 78Z" fill={center} opacity={0.5} />

      {/* Main stem buds - pairs, bottom to top, richer toward top */}
      <Path d={BUD_L(76)} fill={color3} opacity={0.65} />
      <Path d={BUD_R(72)} fill={color3} opacity={0.65} />
      <Path d={BUD_L(62)} fill={color2} opacity={0.75} />
      <Path d={BUD_R(58)} fill={color2} opacity={0.75} />
      <Path d={BUD_L(48)} fill={color1} opacity={0.85} />
      <Path d={BUD_R(44)} fill={color1} opacity={0.85} />
      {/* Top crown buds */}
      <Path d={BUD_L(34)} fill={color1} opacity={0.9} />
      <Path d={BUD_R(30)} fill={color1} opacity={0.9} />
      <Path d="M48 24 C46 16,48 8,50 4 C52 8,54 16,52 24Z" fill={color1} opacity={0.95} />

      {/* Left branch buds */}
      <Path d="M30 56 C24 52,22 46,28 42 C32 46,30 52,30 56Z" fill={color2} opacity={0.7} />
      <Path d="M24 52 C18 48,18 42,24 40 C28 44,24 48,24 52Z" fill={color1} opacity={0.8} />
      {/* Right branch buds */}
      <Path d="M70 44 C76 40,78 34,72 30 C68 34,70 40,70 44Z" fill={color2} opacity={0.7} />
      <Path d="M76 40 C82 36,82 30,76 28 C72 32,76 36,76 40Z" fill={color1} opacity={0.8} />

      {/* Tiny tip dots */}
      <Circle cx={50} cy={4} r={2} fill={color1} opacity={0.9} />
      <Circle cx={22} cy={50} r={1.5} fill={color1} opacity={0.7} />
      <Circle cx={78} cy={38} r={1.5} fill={color1} opacity={0.7} />
    </Svg>
  );
}
