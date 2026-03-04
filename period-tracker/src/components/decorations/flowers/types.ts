import type { ThemeId } from '@/src/theme';

export interface FlowerSvgProps {
  color1: string;   // Deep/rich petal color
  color2: string;   // Medium petal color
  color3: string;   // Light/highlight petal color
  center: string;   // Center/stamen dark color
  width: number;
  height: number;
  opacity?: number;
}

export type FlowerComponent = React.ComponentType<FlowerSvgProps>;

export type FlowerMap = Record<ThemeId, FlowerComponent>;

export interface FlowerHue {
  color1: string;
  color2: string;
  color3: string;
  center: string;
}

export interface ThemeFlowerPalette {
  light: FlowerHue[];
  dark: FlowerHue[];
}
