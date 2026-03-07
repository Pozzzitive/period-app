import type { Cycle, DailyLog, SymptomEntry } from '../models';
import { MIN_CYCLE_LENGTH } from '../constants/phases';

interface SymptomDef {
  id: string;
  label: string;
  icon: string;
}

interface MoodDef {
  id: string;
  label: string;
  icon: string;
}

export interface TopSymptom {
  symptomId: string;
  label: string;
  icon: string;
  count: number;
  percentage: number;
}

export interface MoodDistributionItem {
  moodId: string;
  label: string;
  icon: string;
  count: number;
  percentage: number;
}

export interface CycleAnalytics {
  avgPeriodLength: number;
  shortestPeriod: number;
  longestPeriod: number;
  periodLengthTrend: 'shorter' | 'longer' | 'stable';
  topSymptoms: TopSymptom[];
  moodDistribution: MoodDistributionItem[];
  cycleLengthVariability: number;
  avgPhaseDurations: {
    menstruation: number;
    follicular: number;
    ovulation: number;
    luteal: number;
    premenstrual: number;
  };
  cyclesAnalyzed: number;
}

export function computeAnalytics(
  logs: Record<string, DailyLog>,
  cycles: Cycle[],
  symptomDefs: SymptomDef[],
  moodDefs: MoodDef[],
  cycleCount?: number,
): CycleAnalytics | null {
  let completedCycles = cycles.filter((c) => c.cycleLength != null && c.cycleLength >= MIN_CYCLE_LENGTH);
  if (completedCycles.length === 0) return null;

  if (cycleCount && cycleCount !== Infinity) {
    completedCycles = completedCycles.slice(-cycleCount);
  }

  const cycleLengths = completedCycles.map((c) => c.cycleLength!);
  const periodLengths = completedCycles.map((c) => c.periodLength);

  // Period length stats
  const avgPeriodLength = Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length);
  const shortestPeriod = Math.min(...periodLengths);
  const longestPeriod = Math.max(...periodLengths);

  // Period length trend
  let periodLengthTrend: 'shorter' | 'longer' | 'stable' = 'stable';
  if (periodLengths.length >= 3) {
    const firstHalf = periodLengths.slice(0, Math.floor(periodLengths.length / 2));
    const secondHalf = periodLengths.slice(Math.floor(periodLengths.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    if (secondAvg - firstAvg > 0.5) periodLengthTrend = 'longer';
    else if (firstAvg - secondAvg > 0.5) periodLengthTrend = 'shorter';
  }

  // Cycle length variability (stddev)
  const avgCycleLen = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
  const variance = cycleLengths.length > 1
    ? cycleLengths.reduce((sum, v) => sum + (v - avgCycleLen) ** 2, 0) / (cycleLengths.length - 1)
    : 0;
  const cycleLengthVariability = Math.round(Math.sqrt(variance) * 10) / 10;

  // Get dates in range for completed cycles
  const earliestDate = completedCycles[0].startDate;
  const latestCycle = completedCycles[completedCycles.length - 1];
  const latestDate = latestCycle.endDate ?? latestCycle.startDate;

  // Count symptoms across logs in the analyzed cycles' date range
  const symptomCounts = new Map<string, number>();
  const moodCounts = new Map<string, number>();
  let totalLogDays = 0;

  Object.values(logs).forEach((log) => {
    if (log.date < earliestDate || log.date > latestDate) return;
    totalLogDays++;

    log.symptoms.forEach((s: SymptomEntry) => {
      symptomCounts.set(s.symptomId, (symptomCounts.get(s.symptomId) ?? 0) + 1);
    });

    log.moods.forEach((moodId: string) => {
      moodCounts.set(moodId, (moodCounts.get(moodId) ?? 0) + 1);
    });
  });

  // Top symptoms
  const symptomDefMap = new Map(symptomDefs.map((s) => [s.id, s]));
  const topSymptoms: TopSymptom[] = Array.from(symptomCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id, count]) => {
      const def = symptomDefMap.get(id);
      return {
        symptomId: id,
        label: def?.label ?? id,
        icon: def?.icon ?? '?',
        count,
        percentage: totalLogDays > 0 ? Math.round((count / totalLogDays) * 100) : 0,
      };
    });

  // Mood distribution
  const moodDefMap = new Map(moodDefs.map((m) => [m.id, m]));
  const totalMoodEntries = Array.from(moodCounts.values()).reduce((a, b) => a + b, 0);
  const moodDistribution: MoodDistributionItem[] = Array.from(moodCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => {
      const def = moodDefMap.get(id);
      return {
        moodId: id,
        label: def?.label ?? id,
        icon: def?.icon ?? '?',
        count,
        percentage: totalMoodEntries > 0 ? Math.round((count / totalMoodEntries) * 100) : 0,
      };
    });

  // Average phase durations (proportional estimate)
  const avgCycleLength = Math.round(avgCycleLen);
  const avgPhaseDurations = {
    menstruation: avgPeriodLength,
    follicular: Math.round(avgCycleLength * 0.29),
    ovulation: Math.round(avgCycleLength * 0.07),
    luteal: Math.round(avgCycleLength * 0.29),
    premenstrual: Math.max(1, avgCycleLength - avgPeriodLength - Math.round(avgCycleLength * 0.29) - Math.round(avgCycleLength * 0.07) - Math.round(avgCycleLength * 0.29)),
  };

  return {
    avgPeriodLength,
    shortestPeriod,
    longestPeriod,
    periodLengthTrend,
    topSymptoms,
    moodDistribution,
    cycleLengthVariability,
    avgPhaseDurations,
    cyclesAnalyzed: completedCycles.length,
  };
}
