import { useMemo } from 'react';
import { useCycleStore } from '../stores';
import type { BarChartData } from '../components/charts/BarChart';

interface TrendData {
  cycleLengths: BarChartData[];
  periodLengths: BarChartData[];
  avgCycleLength: number;
  avgPeriodLength: number;
}

export function useTrendData(lastN?: number): TrendData {
  const cycles = useCycleStore((s) => s.cycles);

  return useMemo(() => {
    let completed = cycles.filter((c) => c.cycleLength != null);
    if (lastN) {
      completed = completed.slice(-lastN);
    }

    const cycleLengths: BarChartData[] = completed.map((c, i) => ({
      label: `C${i + 1}`,
      value: c.cycleLength!,
    }));

    const periodLengths: BarChartData[] = completed.map((c, i) => ({
      label: `C${i + 1}`,
      value: c.periodLength,
    }));

    const avgCycleLength = cycleLengths.length > 0
      ? Math.round(cycleLengths.reduce((sum, d) => sum + d.value, 0) / cycleLengths.length)
      : 0;

    const avgPeriodLength = periodLengths.length > 0
      ? Math.round(periodLengths.reduce((sum, d) => sum + d.value, 0) / periodLengths.length)
      : 0;

    return { cycleLengths, periodLengths, avgCycleLength, avgPeriodLength };
  }, [cycles, lastN]);
}
