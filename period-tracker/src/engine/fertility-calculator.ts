import { addDays, parseISO, format, isWithinInterval } from 'date-fns';

export interface FertilityWindow {
  fertileStart: string;   // YYYY-MM-DD
  fertileEnd: string;     // YYYY-MM-DD (ovulation day)
  ovulationDate: string;  // YYYY-MM-DD
  peakStart: string;      // ovulation - 1
  peakEnd: string;        // ovulation day
}

/**
 * Calculate fertility window using the calendar method.
 * Ovulation = cycleLength - 14
 * Fertile window = 5 days before ovulation + ovulation day (6 days total)
 * Peak fertility = ovulation day +/- 1 day
 */
export function calculateFertilityWindow(
  cycleStartDate: string,
  cycleLength: number
): FertilityWindow {
  const start = parseISO(cycleStartDate);

  // Ovulation day (0-indexed from cycle start)
  const ovulationDayOffset = cycleLength - 14;
  const ovulationDate = addDays(start, ovulationDayOffset - 1); // -1 because cycle day 1 = start

  const fertileStart = addDays(ovulationDate, -5);
  const fertileEnd = ovulationDate;

  const peakStart = addDays(ovulationDate, -1);
  const peakEnd = ovulationDate;

  return {
    fertileStart: format(fertileStart, 'yyyy-MM-dd'),
    fertileEnd: format(fertileEnd, 'yyyy-MM-dd'),
    ovulationDate: format(ovulationDate, 'yyyy-MM-dd'),
    peakStart: format(peakStart, 'yyyy-MM-dd'),
    peakEnd: format(peakEnd, 'yyyy-MM-dd'),
  };
}

export type FertilityLevel = 'high' | 'peak' | 'low' | 'none';

/**
 * Get the fertility level for a specific date.
 */
export function getFertilityLevel(
  dateStr: string,
  window: FertilityWindow | null
): FertilityLevel {
  if (!window) return 'none';

  const date = parseISO(dateStr);
  const peakStart = parseISO(window.peakStart);
  const peakEnd = parseISO(window.peakEnd);
  const fertileStart = parseISO(window.fertileStart);
  const fertileEnd = parseISO(window.fertileEnd);

  if (isWithinInterval(date, { start: peakStart, end: peakEnd })) {
    return 'peak';
  }

  if (isWithinInterval(date, { start: fertileStart, end: fertileEnd })) {
    return 'high';
  }

  return 'none';
}

export const FERTILITY_DISCLAIMER =
  'Cycle predictions are estimates based on your logged data. They should not be used as the sole method of contraception or conception planning. Please consult a healthcare provider for personalized advice.';
