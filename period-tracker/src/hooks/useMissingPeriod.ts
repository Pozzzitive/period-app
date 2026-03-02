import { useMemo } from 'react';
import { useCycleStore } from '../stores';
import { usePrediction } from './usePrediction';
import { shouldShowMissingPeriodPrompt } from '../engine/prediction-engine';
import { todayString } from '../utils/dates';

export function useMissingPeriod() {
  const prediction = usePrediction();
  const periods = useCycleStore((s) => s.periods);

  const shouldShow = useMemo(() => {
    if (!prediction) return false;

    const today = todayString();
    const periodsAfter = periods
      .filter((p) => p.startDate >= prediction.nextPeriodStart)
      .map((p) => p.startDate);

    return shouldShowMissingPeriodPrompt(prediction, today, periodsAfter);
  }, [prediction, periods]);

  return { shouldShow, prediction };
}
