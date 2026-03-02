import { useMemo } from 'react';
import { useCycleStore, useUserStore } from '../stores';
import { predictMultiplePeriods } from '../engine';
import type { PredictedPeriod } from '../engine';

export function useMultiplePredictions(count: number): PredictedPeriod[] {
  const cycles = useCycleStore((s) => s.cycles);
  const profile = useUserStore((s) => s.profile);

  return useMemo(() => {
    if (count <= 0 || cycles.length === 0) return [];
    return predictMultiplePeriods(
      cycles,
      count,
      profile.typicalCycleLength,
      profile.typicalPeriodLength,
    );
  }, [cycles, count, profile.typicalCycleLength, profile.typicalPeriodLength]);
}
