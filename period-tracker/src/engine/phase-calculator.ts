import { differenceInDays, parseISO } from 'date-fns';
import type { PhaseInfo } from '../models';
import type { CyclePhase } from '../constants/phases';
import { DEFAULT_CYCLE_LENGTH } from '../constants/phases';

/**
 * Phase proportions based on a standard 28-day cycle.
 * These are scaled proportionally to the actual cycle length.
 */
const PHASE_PROPORTIONS: Record<CyclePhase, { start: number; end: number }> = {
  menstruation: { start: 0, end: 5 / 28 },        // ~18% of cycle
  follicular:   { start: 5 / 28, end: 13 / 28 },   // ~29% of cycle
  ovulation:    { start: 13 / 28, end: 15 / 28 },   // ~7% of cycle
  luteal:       { start: 15 / 28, end: 23 / 28 },   // ~29% of cycle
  premenstrual: { start: 23 / 28, end: 1 },          // ~18% of cycle
};

/**
 * Calculate the current cycle phase for a given date.
 *
 * @param dateStr - The date to check (YYYY-MM-DD)
 * @param cycleStartDate - Start date of the current cycle (YYYY-MM-DD)
 * @param cycleLength - Expected total length of the cycle
 * @param periodLength - Length of the menstruation period
 */
export function calculatePhase(
  dateStr: string,
  cycleStartDate: string,
  cycleLength: number = DEFAULT_CYCLE_LENGTH,
  periodLength: number = 5
): PhaseInfo | null {
  const date = parseISO(dateStr);
  const cycleStart = parseISO(cycleStartDate);
  const dayInCycle = differenceInDays(date, cycleStart) + 1; // 1-indexed

  if (dayInCycle < 1 || dayInCycle > cycleLength) return null;

  // Scale phase boundaries to actual cycle length
  const phases: Array<{ phase: CyclePhase; startDay: number; endDay: number }> = [];

  // Menstruation: always uses actual period length
  phases.push({
    phase: 'menstruation',
    startDay: 1,
    endDay: periodLength,
  });

  // Ovulation is fixed at cycleLength - 14 (calendar method)
  const ovulationDay = Math.max(cycleLength - 14, periodLength + 2);

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
    endDay: Math.min(ovulationDay + 1, cycleLength),
  });

  // Premenstrual: last 5 days of cycle
  const pmsStart = Math.max(cycleLength - 4, ovulationDay + 2);

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
    endDay: cycleLength,
  });

  // Find which phase the current day falls in
  for (const p of phases) {
    if (dayInCycle >= p.startDay && dayInCycle <= p.endDay) {
      return {
        phase: p.phase,
        dayInPhase: dayInCycle - p.startDay + 1,
        dayInCycle,
        totalPhaseDays: p.endDay - p.startDay + 1,
        cycleLength,
      };
    }
  }

  // Fallback: if day is beyond all defined phases (edge case with very short cycles)
  return {
    phase: 'luteal',
    dayInPhase: 1,
    dayInCycle,
    totalPhaseDays: 1,
    cycleLength,
  };
}

/**
 * Get all phase ranges for a cycle (for calendar coloring).
 */
export function getCyclePhaseRanges(
  cycleStartDate: string,
  cycleLength: number = DEFAULT_CYCLE_LENGTH,
  periodLength: number = 5
): Array<{ phase: CyclePhase; startDay: number; endDay: number }> {
  const ovulationDay = Math.max(cycleLength - 14, periodLength + 2);
  const pmsStart = Math.max(cycleLength - 4, ovulationDay + 2);

  const ranges: Array<{ phase: CyclePhase; startDay: number; endDay: number }> = [
    { phase: 'menstruation', startDay: 1, endDay: periodLength },
    { phase: 'follicular', startDay: periodLength + 1, endDay: ovulationDay - 1 },
    { phase: 'ovulation', startDay: ovulationDay, endDay: Math.min(ovulationDay + 1, cycleLength) },
    { phase: 'luteal', startDay: ovulationDay + 2, endDay: pmsStart - 1 },
    { phase: 'premenstrual', startDay: pmsStart, endDay: cycleLength },
  ];
  return ranges.filter((p) => p.startDay <= p.endDay);
}
