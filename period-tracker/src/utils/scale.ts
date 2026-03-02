import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;
const wScale = width / BASE_WIDTH;
const hScale = height / BASE_HEIGHT;

/** Scale for spacing, sizing, layout (padding, margin, gap, width, borderRadius, icons) */
export function s(size: number): number {
  return Math.round(PixelRatio.roundToNearestPixel(size * wScale));
}

/** Vertical scale (rare — fixed-height containers only) */
export function vs(size: number): number {
  return Math.round(PixelRatio.roundToNearestPixel(size * hScale));
}

/** Font scale — moderated at 50% to prevent oversized/undersized text */
export function fs(size: number): number {
  const mod = 1 + (wScale - 1) * 0.5;
  return Math.round(PixelRatio.roundToNearestPixel(size * mod));
}

export const SCREEN_W = width;
export const SCREEN_H = height;
