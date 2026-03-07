import { differenceInDays, parseISO } from 'date-fns';
import type { PhaseInfo } from '../models';
import type { CyclePhase } from '../constants/phases';
import { DEFAULT_CYCLE_LENGTH } from '../constants/phases';

/**
 * Calculate the current cycle phase for a given date.
 *
 * @param dateStr - The date to check (YYYY-MM-DD)
 * @param cycleStartDate - Start date of the current cycle (YYYY-MM-DD)
 * @param cycleLength - Expected total length of the cycle
 * @param periodLength - Length of the menstruation period
 * @param effectiveCycleLength - When the period is late, pass max(cycleLength, todayDayInCycle)
 *   to stretch all phases proportionally. Must be consistent across all dates in the same cycle.
 */
export function calculatePhase(
  dateStr: string,
  cycleStartDate: string,
  cycleLength: number = DEFAULT_CYCLE_LENGTH,
  periodLength: number = 5,
  effectiveCycleLength?: number,
): PhaseInfo | null {
  const date = parseISO(dateStr);
  const cycleStart = parseISO(cycleStartDate);
  const dayInCycle = differenceInDays(date, cycleStart) + 1; // 1-indexed

  const effLen = effectiveCycleLength ?? cycleLength;
  if (dayInCycle < 1 || dayInCycle > effLen) return null;

  // Scale phase boundaries to effective cycle length
  const phases: Array<{ phase: CyclePhase; startDay: number; endDay: number }> = [];

  // Menstruation: always uses actual period length
  phases.push({
    phase: 'menstruation',
    startDay: 1,
    endDay: periodLength,
  });

  // Ovulation is fixed at effLen - 14 (calendar method)
  const ovulationDay = Math.max(effLen - 14, periodLength + 2);

  // Follicular: from end of period to ovulation - 1
  phases.push({
    phase: 'follicular',
    startDay: periodLength + 1,
    endDay: ovulationDay - 1,
  });

  // Ovulation: 2-3 days centered on ovulation day
  phases.push({
    phase: 'ovulation',
    startDay: ovulationDay,
    endDay: Math.min(ovulationDay + 1, effLen),
  });

  // Premenstrual: last 5 days of cycle
  const pmsStart = Math.max(effLen - 4, ovulationDay + 2);

  // Luteal: from after ovulation to before PMS
  phases.push({
    phase: 'luteal',
    startDay: ovulationDay + 2,
    endDay: pmsStart - 1,
  });

  // Premenstrual
  phases.push({
    phase: 'premenstrual',
    startDay: pmsStart,
    endDay: effLen,
  });

  // Find which phase the current day falls in
  for (const p of phases) {
    if (dayInCycle >= p.startDay && dayInCycle <= p.endDay) {
      return {
        phase: p.phase,
        dayInPhase: dayInCycle - p.startDay + 1,
        dayInCycle,
        totalPhaseDays: p.endDay - p.startDay + 1,
        cycleLength, // original, so ring shows "Day 32 of 28"
      };
    }
  }

  // Fallback: edge case with very short cycles
  return {
    phase: 'premenstrual',
    dayInPhase: dayInCycle - pmsStart + 1,
    dayInCycle,
    totalPhaseDays: effLen - pmsStart + 1,
    cycleLength,
  };
}

/**
 * Get all phase ranges for a cycle (for calendar coloring).
 */
export function getCyclePhaseRanges(
  cycleStartDate: string,
  cycleLength: number = DEFAULT_CYCLE_LENGTH,
  periodLength: number = 5,
  lateDays: number = 0,
): Array<{ phase: CyclePhase; startDay: number; endDay: number }> {
  const effectiveLength = cycleLength + lateDays;
  const ovulationDay = Math.max(effectiveLength - 14, periodLength + 2);
  const pmsStart = Math.max(effectiveLength - 4, ovulationDay + 2);

  const ranges: Array<{ phase: CyclePhase; startDay: number; endDay: number }> = [
    { phase: 'menstruation', startDay: 1, endDay: periodLength },
    { phase: 'follicular', startDay: periodLength + 1, endDay: ovulationDay - 1 },
    { phase: 'ovulation', startDay: ovulationDay, endDay: Math.min(ovulationDay + 1, effectiveLength) },
    { phase: 'luteal', startDay: ovulationDay + 2, endDay: pmsStart - 1 },
    { phase: 'premenstrual', startDay: pmsStart, endDay: effectiveLength },
  ];
  return ranges.filter((p) => p.startDay <= p.endDay);
}
