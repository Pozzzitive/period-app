import { differenceInDays, parseISO } from 'date-fns';
import type { Cycle, DailyLog, SymptomEntry } from '../models';
import { MIN_CYCLE_LENGTH } from '../constants/phases';

export interface SymptomPattern {
  symptomId: string;
  label: string;
  icon: string;
  cycleDay: number;
  phase: string;
  occurrenceRate: number;
  cyclesWithSymptom: number;
  totalCycles: number;
  description: string;
}

interface SymptomDef {
  id: string;
  label: string;
  icon: string;
}

function getPhaseLabel(cycleDay: number, cycleLength: number): string {
  const periodEnd = Math.round(cycleLength * 0.18);
  const follicularEnd = Math.round(cycleLength * 0.47);
  const ovulationEnd = Math.round(cycleLength * 0.54);
  const lutealEnd = Math.round(cycleLength * 0.82);

  if (cycleDay <= periodEnd) return 'your period';
  if (cycleDay <= follicularEnd) return 'the follicular phase';
  if (cycleDay <= ovulationEnd) return 'ovulation';
  if (cycleDay <= lutealEnd) return 'the luteal phase';
  return 'the premenstrual phase';
}

function getDayDescription(cycleDay: number, cycleLength: number): string {
  const periodEnd = Math.round(cycleLength * 0.18);

  if (cycleDay <= periodEnd) {
    return `on day ${cycleDay} of your period`;
  }

  const daysBeforePeriod = cycleLength - cycleDay;
  if (daysBeforePeriod <= 5) {
    return `${daysBeforePeriod} day${daysBeforePeriod === 1 ? '' : 's'} before your period`;
  }

  return `around day ${cycleDay} of your cycle`;
}

export function analyzeSymptomPatterns(
  logs: Record<string, DailyLog>,
  cycles: Cycle[],
  symptomDefs: SymptomDef[],
): SymptomPattern[] {
  const completedCycles = cycles.filter((c) => c.cycleLength != null && c.cycleLength >= MIN_CYCLE_LENGTH);
  if (completedCycles.length < 3) return [];

  const symptomDefMap = new Map(symptomDefs.map((s) => [s.id, s]));

  // Map: symptomId -> cycleDay -> count of cycles where it appeared on that day
  const symptomDayMap = new Map<string, Map<number, number>>();
  // Track which cycles had each symptom at all
  const symptomCycleCount = new Map<string, Set<number>>();

  completedCycles.forEach((cycle, cycleIndex) => {
    const cycleStart = parseISO(cycle.startDate);
    const cycleLen = cycle.cycleLength!;

    // Find all logs within this cycle
    Object.values(logs).forEach((log) => {
      const logDate = parseISO(log.date);
      const dayInCycle = differenceInDays(logDate, cycleStart) + 1;

      if (dayInCycle < 1 || dayInCycle > cycleLen) return;

      log.symptoms.forEach((symptomEntry: SymptomEntry) => {
        const { symptomId } = symptomEntry;

        if (!symptomDayMap.has(symptomId)) {
          symptomDayMap.set(symptomId, new Map());
        }
        const dayMap = symptomDayMap.get(symptomId)!;
        dayMap.set(dayInCycle, (dayMap.get(dayInCycle) ?? 0) + 1);

        if (!symptomCycleCount.has(symptomId)) {
          symptomCycleCount.set(symptomId, new Set());
        }
        symptomCycleCount.get(symptomId)!.add(cycleIndex);
      });
    });
  });

  const totalCycles = completedCycles.length;
  const avgCycleLength = Math.round(
    completedCycles.reduce((sum, c) => sum + c.cycleLength!, 0) / totalCycles
  );
  const patterns: SymptomPattern[] = [];

  symptomDayMap.forEach((dayMap, symptomId) => {
    const def = symptomDefMap.get(symptomId);
    if (!def) return;

    const cyclesWithSymptom = symptomCycleCount.get(symptomId)?.size ?? 0;
    const overallRate = cyclesWithSymptom / totalCycles;

    // Only show patterns present in >50% of cycles
    if (overallRate < 0.5) return;

    // Find the peak day — the cycle day with highest occurrence count
    let peakDay = 1;
    let peakCount = 0;
    dayMap.forEach((count, day) => {
      if (count > peakCount) {
        peakCount = count;
        peakDay = day;
      }
    });

    const peakRate = peakCount / totalCycles;
    // Only include if peak day occurs in at least 50% of cycles
    if (peakRate < 0.5) return;

    const dayDesc = getDayDescription(peakDay, avgCycleLength);
    const phase = getPhaseLabel(peakDay, avgCycleLength);

    patterns.push({
      symptomId,
      label: def.label,
      icon: def.icon,
      cycleDay: peakDay,
      phase,
      occurrenceRate: Math.round(peakRate * 100),
      cyclesWithSymptom,
      totalCycles,
      description: `You tend to get ${def.label.toLowerCase()} ${dayDesc}`,
    });
  });

  // Sort by occurrence rate descending
  patterns.sort((a, b) => b.occurrenceRate - a.occurrenceRate);

  return patterns;
}
