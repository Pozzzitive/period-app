import { useMemo } from 'react';
import { useCycleStore } from '../stores';
import { useUserStore } from '../stores';
import { calculatePhase } from '../engine';
import { todayString } from '../utils/dates';
import type { PhaseInfo } from '../models';

export function useCyclePhase(dateStr?: string): PhaseInfo | null {
  const cycles = useCycleStore((s) => s.cycles);
  const profile = useUserStore((s) => s.profile);
  const date = dateStr ?? todayString();

  return useMemo(() => {
    if (cycles.length === 0) return null;

    // Find the cycle this date falls in
    const cycle = cycles.find((c) => {
      if (date < c.startDate) return false;
      if (c.endDate && date >= c.endDate) return false;
      return true;
    });

    // If no matching cycle, use the last cycle and predict forward
    const activeCycle = cycle ?? cycles[cycles.length - 1];
    const cycleLength = activeCycle.cycleLength ?? profile.typicalCycleLength;
    const periodLength = activeCycle.periodLength ?? profile.typicalPeriodLength;

    return calculatePhase(date, activeCycle.startDate, cycleLength, periodLength);
  }, [cycles, profile.typicalCycleLength, profile.typicalPeriodLength, date]);
}
