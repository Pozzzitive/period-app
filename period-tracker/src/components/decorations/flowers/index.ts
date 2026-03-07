import type { FlowerMap, ThemeFlowerPalette, FlowerHue } from './types';
import type { ThemeId } from '@/src/theme';
import { RoseFlower } from './RoseFlower';
import { SakuraFlower } from './SakuraFlower';
import { LavenderFlower } from './LavenderFlower';
import { TropicalFlower } from './TropicalFlower';
import { DahliaFlower } from './DahliaFlower';
import { PeonyFlower } from './PeonyFlower';
import { NoirBotanical } from './NoirBotanical';

export const FLOWER_MAP: FlowerMap = {
  roseGarden: RoseFlower,
  oceanBreeze: SakuraFlower,
  lavenderDreams: LavenderFlower,
  coralSunset: TropicalFlower,
  forestGlow: DahliaFlower,
  goldenHour: PeonyFlower,
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
  oceanBreeze: {
    light: [
      { color1: '#087A70', color2: '#0D9488', color3: '#5EEAD4', center: '#03312C' },
      { color1: '#0E8A7E', color2: '#14B8A6', color3: '#6EE7D0', center: '#053830' },
      { color1: '#067066', color2: '#0D9488', color3: '#4AD8C0', center: '#022E28' },
      { color1: '#0C8078', color2: '#10A898', color3: '#5EEAD4', center: '#043430' },
    ],
    dark: [
      { color1: '#0D9488', color2: '#2DD4BF', color3: '#5EEAD4', center: '#062018' },
      { color1: '#10A898', color2: '#34D4C0', color3: '#6EE7D0', center: '#08241C' },
      { color1: '#0B8A80', color2: '#28CCB8', color3: '#50E0CC', center: '#041C14' },
      { color1: '#0E9C90', color2: '#30D0BC', color3: '#60E4D0', center: '#06201A' },
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
  forestGlow: {
    light: [
      { color1: '#047857', color2: '#059669', color3: '#6EE7B7', center: '#022E22' },
      { color1: '#058862', color2: '#10B981', color3: '#7EECC4', center: '#03362A' },
      { color1: '#036E50', color2: '#059669', color3: '#5EE0AE', center: '#022A1E' },
      { color1: '#047E5C', color2: '#0CA474', color3: '#6EE7B7', center: '#03302A' },
    ],
    dark: [
      { color1: '#059669', color2: '#34D399', color3: '#6EE7B7', center: '#041E10' },
      { color1: '#0CA474', color2: '#3CD8A0', color3: '#7EECC4', center: '#062214' },
      { color1: '#048A60', color2: '#2CCC90', color3: '#60E0B0', center: '#031A0C' },
      { color1: '#0A9E6E', color2: '#38D49C', color3: '#70E8BC', center: '#04200E' },
    ],
  },
  goldenHour: {
    light: [
      { color1: '#B45309', color2: '#D97706', color3: '#FCD34D', center: '#4A2008' },
      { color1: '#C66810', color2: '#E8880E', color3: '#FDE68A', center: '#52280A' },
      { color1: '#A04A08', color2: '#CA6E06', color3: '#F5C640', center: '#421C06' },
      { color1: '#BE5E0C', color2: '#E0800A', color3: '#FCD34D', center: '#4E240A' },
    ],
    dark: [
      { color1: '#D97706', color2: '#FBBF24', color3: '#FDE68A', center: '#281808' },
      { color1: '#E08810', color2: '#F5C830', color3: '#FDE890', center: '#2E1C0A' },
      { color1: '#CC6E06', color2: '#F0B020', color3: '#FCDC70', center: '#221406' },
      { color1: '#D88008', color2: '#F8C028', color3: '#FDE480', center: '#2A1808' },
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
