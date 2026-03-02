import { useMemo } from 'react';
import { useCycleStore, useUserStore, useSettingsStore } from '../stores';
import { calculateFertilityWindow, getFertilityLevel } from '../engine';
import type { FertilityWindow, FertilityLevel } from '../engine';
import { todayString } from '../utils/dates';

export function useFertility(dateStr?: string) {
  const cycles = useCycleStore((s) => s.cycles);
  const profile = useUserStore((s) => s.profile);
  const fertilityEnabled = useSettingsStore((s) => s.settings.fertilityTrackingEnabled);
  const date = dateStr ?? todayString();

  const window = useMemo((): FertilityWindow | null => {
    if (!fertilityEnabled || profile.isTeenager) return null;
    if (cycles.length === 0) return null;

    const lastCycle = cycles[cycles.length - 1];
    const cycleLength = lastCycle.cycleLength ?? profile.typicalCycleLength;
    return calculateFertilityWindow(lastCycle.startDate, cycleLength);
  }, [cycles, profile.typicalCycleLength, profile.isTeenager, fertilityEnabled]);

  const level = useMemo((): FertilityLevel => {
    return getFertilityLevel(date, window);
  }, [date, window]);

  return { window, level, enabled: fertilityEnabled && !profile.isTeenager };
}
