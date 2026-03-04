import type { FlowerMap, ThemeFlowerPalette, FlowerHue } from './types';
import type { ThemeId } from '@/src/theme';
import { RoseFlower } from './RoseFlower';
import { MoonFlower } from './MoonFlower';
import { SakuraFlower } from './SakuraFlower';
import { LavenderFlower } from './LavenderFlower';
import { TropicalFlower } from './TropicalFlower';
import { DahliaFlower } from './DahliaFlower';
import { PeonyFlower } from './PeonyFlower';
import { NoirBotanical } from './NoirBotanical';

export const FLOWER_MAP: FlowerMap = {
  roseGarden: RoseFlower,
  midnight: MoonFlower,
  cherryBlossom: SakuraFlower,
  lavenderDreams: LavenderFlower,
  coralSunset: TropicalFlower,
  velvetMauve: DahliaFlower,
  peonyBlush: PeonyFlower,
  noir: NoirBotanical,
};

/**
 * Rich multi-color palettes per theme.
 * Each hue set creates a visually distinct flower so adjacent
 * flowers don't look monotone.
 */
export const FLOWER_PALETTES: Record<ThemeId, ThemeFlowerPalette> = {
  roseGarden: {
    light: [
      { color1: '#C24060', color2: '#D4587A', color3: '#F5A0B8', center: '#5C1E2E' },
      { color1: '#D86040', color2: '#E88868', color3: '#F5C0A8', center: '#6E2818' },
      { color1: '#B03060', color2: '#D06888', color3: '#F0B8C8', center: '#4A1428' },
      { color1: '#D4587A', color2: '#E890A8', color3: '#FAD0DC', center: '#582030' },
    ],
    dark: [
      { color1: '#E86080', color2: '#F06B8A', color3: '#F5A0B8', center: '#3A1018' },
      { color1: '#D87050', color2: '#E88868', color3: '#F5B898', center: '#3A1810' },
      { color1: '#C84068', color2: '#E06888', color3: '#F0A0B8', center: '#2E0C18' },
      { color1: '#F06B8A', color2: '#F090A8', color3: '#F8C0D0', center: '#3A1520' },
    ],
  },
  midnight: {
    light: [
      { color1: '#C84068', color2: '#E06888', color3: '#F0A0B8', center: '#2E0C18' },
      { color1: '#D87050', color2: '#E88868', color3: '#F5B898', center: '#3A1810' },
      { color1: '#A84878', color2: '#C870A0', color3: '#E8A8C8', center: '#280C20' },
      { color1: '#E86080', color2: '#F088A0', color3: '#F8B8C8', center: '#3A1018' },
    ],
    dark: [
      { color1: '#C84068', color2: '#E06888', color3: '#F0A0B8', center: '#2E0C18' },
      { color1: '#D87050', color2: '#E88868', color3: '#F5B898', center: '#3A1810' },
      { color1: '#A84878', color2: '#C870A0', color3: '#E8A8C8', center: '#280C20' },
      { color1: '#E86080', color2: '#F088A0', color3: '#F8B8C8', center: '#3A1018' },
    ],
  },
  cherryBlossom: {
    light: [
      { color1: '#C0506E', color2: '#D87898', color3: '#F5B8CC', center: '#5A1828' },
      { color1: '#D06080', color2: '#E898B0', color3: '#F8D0DC', center: '#4E1420' },
      { color1: '#B84868', color2: '#D07090', color3: '#F0A8C0', center: '#4A1024' },
      { color1: '#C85878', color2: '#E08898', color3: '#F5C0D0', center: '#541C2A' },
    ],
    dark: [
      { color1: '#D86080', color2: '#E88BA0', color3: '#F5B0C0', center: '#301018' },
      { color1: '#C85070', color2: '#E07890', color3: '#F0A8B8', center: '#280C14' },
      { color1: '#E07088', color2: '#F098B0', color3: '#F8C0D0', center: '#381420' },
      { color1: '#D06878', color2: '#E89098', color3: '#F5B8C8', center: '#2E1018' },
    ],
  },
  lavenderDreams: {
    light: [
      { color1: '#7048A8', color2: '#8B5FBF', color3: '#C0A0E0', center: '#2E1450' },
      { color1: '#9060B0', color2: '#B08AE6', color3: '#D4B8F0', center: '#3A1858' },
      { color1: '#6840A0', color2: '#9070C8', color3: '#C4A8E0', center: '#281048' },
      { color1: '#8050B8', color2: '#A878D8', color3: '#D0B0F0', center: '#341658' },
    ],
    dark: [
      { color1: '#9068C8', color2: '#B08AE6', color3: '#D0B0F8', center: '#1C0C30' },
      { color1: '#A078D0', color2: '#C098F0', color3: '#DCC0F8', center: '#201038' },
      { color1: '#7858B8', color2: '#9878D0', color3: '#C0A0E8', center: '#180A28' },
      { color1: '#8860C0', color2: '#A880E0', color3: '#CCB0F0', center: '#1E0E34' },
    ],
  },
  coralSunset: {
    light: [
      { color1: '#D04838', color2: '#E8685A', color3: '#F5A090', center: '#6E1810' },
      { color1: '#E07040', color2: '#F09060', color3: '#F8C0A0', center: '#702810' },
      { color1: '#C84040', color2: '#E06050', color3: '#F59888', center: '#601410' },
      { color1: '#D85848', color2: '#F08068', color3: '#F8B8A0', center: '#6A2010' },
    ],
    dark: [
      { color1: '#E06050', color2: '#F0806E', color3: '#F8B0A0', center: '#381008' },
      { color1: '#D87848', color2: '#F09868', color3: '#F8C8A8', center: '#3A1808' },
      { color1: '#E84838', color2: '#F07058', color3: '#F8A890', center: '#300C08' },
      { color1: '#D86850', color2: '#F08870', color3: '#F8B8A8', center: '#381410' },
    ],
  },
  velvetMauve: {
    light: [
      { color1: '#803868', color2: '#9C5A8A', color3: '#D0A0C0', center: '#3A1030' },
      { color1: '#984878', color2: '#B870A0', color3: '#E0B8D0', center: '#421438' },
      { color1: '#703060', color2: '#904878', color3: '#C890B0', center: '#300C28' },
      { color1: '#884070', color2: '#A86090', color3: '#D8A8C8', center: '#3C1234' },
    ],
    dark: [
      { color1: '#A06088', color2: '#C88AB8', color3: '#E8B8D8', center: '#201020' },
      { color1: '#B07098', color2: '#D098C0', color3: '#F0C8E0', center: '#281428' },
      { color1: '#905078', color2: '#B068A0', color3: '#D8A0C8', center: '#1C0C1C' },
      { color1: '#A86090', color2: '#C880B0', color3: '#E8B0D0', center: '#241224' },
    ],
  },
  peonyBlush: {
    light: [
      { color1: '#C04868', color2: '#E07090', color3: '#F8B0C8', center: '#581828' },
      { color1: '#D06078', color2: '#F098B0', color3: '#F8D0DC', center: '#5A1C2A' },
      { color1: '#B84060', color2: '#D86888', color3: '#F5A8C0', center: '#4E1424' },
      { color1: '#D85878', color2: '#F08898', color3: '#F8C8D8', center: '#5C2030' },
    ],
    dark: [
      { color1: '#D86080', color2: '#F098B0', color3: '#F8C0D0', center: '#2E0C18' },
      { color1: '#E07088', color2: '#F0A0B8', color3: '#F8D0DC', center: '#341020' },
      { color1: '#C85070', color2: '#E88898', color3: '#F5B8C8', center: '#280A14' },
      { color1: '#D86878', color2: '#F090A8', color3: '#F8C8D8', center: '#301018' },
    ],
  },
  noir: {
    light: [
      { color1: '#3878D0', color2: '#60A5FA', color3: '#A0C8FF', center: '#142850' },
      { color1: '#4888E0', color2: '#70B0F8', color3: '#B0D0FF', center: '#183060' },
      { color1: '#3068C0', color2: '#5898F0', color3: '#98C0FF', center: '#102248' },
      { color1: '#4080D8', color2: '#68A8F8', color3: '#A8D0FF', center: '#162C58' },
    ],
    dark: [
      { color1: '#3878D0', color2: '#60A5FA', color3: '#90B8F0', center: '#0C1830' },
      { color1: '#4888E0', color2: '#70B0F8', color3: '#A0C8F8', center: '#101C38' },
      { color1: '#3068C0', color2: '#5090E8', color3: '#88B0F0', center: '#0A1428' },
      { color1: '#4080D8', color2: '#68A0F0', color3: '#98C0F8', center: '#0E1A34' },
    ],
  },
};

export type { FlowerSvgProps, FlowerComponent, FlowerHue, ThemeFlowerPalette } from './types';
