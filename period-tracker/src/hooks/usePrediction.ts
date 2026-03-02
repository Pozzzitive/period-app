import { useMemo } from 'react';
import { useCycleStore, useUserStore } from '../stores';
import { predictNextPeriod } from '../engine';
import type { PredictionResult } from '../models';

export function usePrediction(): PredictionResult | null {
  const cycles = useCycleStore((s) => s.cycles);
  const profile = useUserStore((s) => s.profile);

  return useMemo(() => {
    return predictNextPeriod(
      cycles,
      profile.typicalCycleLength,
      profile.typicalPeriodLength
    );
  }, [cycles, profile.typicalCycleLength, profile.typicalPeriodLength]);
}
