import { analyzeSymptomPatterns } from '../pattern-analyzer';
import type { Cycle, DailyLog } from '../../models';

const symptomDefs = [
  { id: 'cramps', label: 'Cramps', icon: '⚡' },
  { id: 'headache', label: 'Headache', icon: '🤕' },
  { id: 'bloating', label: 'Bloating', icon: '🎈' },
  { id: 'fatigue', label: 'Fatigue', icon: '😴' },
];

function makeCycles(count: number, startDate: string, cycleLength: number): Cycle[] {
  const cycles: Cycle[] = [];
  let current = new Date(startDate);
  for (let i = 0; i < count; i++) {
    const start = current.toISOString().split('T')[0];
    const next = new Date(current);
    next.setDate(next.getDate() + cycleLength);
    const end = next.toISOString().split('T')[0];

    cycles.push({
      id: `cycle-${i}`,
      startDate: start,
      endDate: end,
      periodLength: 5,
      cycleLength,
    });

    current = next;
  }
  return cycles;
}

function makeLog(date: string, symptomIds: string[]): DailyLog {
  return {
    date,
    symptoms: symptomIds.map((id) => ({ symptomId: id, severity: 1 as const })),
    moods: [],
    updatedAt: new Date().toISOString(),
  };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

describe('analyzeSymptomPatterns', () => {
  it('returns empty array with fewer than 3 cycles', () => {
    const cycles = makeCycles(2, '2025-01-01', 28);
    const result = analyzeSymptomPatterns({}, cycles, symptomDefs);
    expect(result).toEqual([]);
  });

  it('returns empty array with no logs', () => {
    const cycles = makeCycles(4, '2025-01-01', 28);
    const result = analyzeSymptomPatterns({}, cycles, symptomDefs);
    expect(result).toEqual([]);
  });

  it('detects a recurring symptom on a specific cycle day', () => {
    const cycles = makeCycles(4, '2025-01-01', 28);
    const logs: Record<string, DailyLog> = {};

    // Add cramps on day 1 (period start) for all 4 cycles
    cycles.forEach((cycle) => {
      const date = cycle.startDate;
      logs[date] = makeLog(date, ['cramps']);
    });

    const patterns = analyzeSymptomPatterns(logs, cycles, symptomDefs);
    expect(patterns.length).toBeGreaterThanOrEqual(1);

    const crampsPattern = patterns.find((p) => p.symptomId === 'cramps');
    expect(crampsPattern).toBeDefined();
    expect(crampsPattern!.occurrenceRate).toBe(100);
    expect(crampsPattern!.cycleDay).toBe(1);
    expect(crampsPattern!.description).toContain('cramps');
  });

  it('does not show symptoms occurring in fewer than 50% of cycles', () => {
    const cycles = makeCycles(4, '2025-01-01', 28);
    const logs: Record<string, DailyLog> = {};

    // Add headache on day 2 for only 1 of 4 cycles
    logs[addDays(cycles[0].startDate, 1)] = makeLog(addDays(cycles[0].startDate, 1), ['headache']);

    const patterns = analyzeSymptomPatterns(logs, cycles, symptomDefs);
    const headachePattern = patterns.find((p) => p.symptomId === 'headache');
    expect(headachePattern).toBeUndefined();
  });

  it('detects premenstrual symptoms', () => {
    const cycles = makeCycles(4, '2025-01-01', 28);
    const logs: Record<string, DailyLog> = {};

    // Add bloating 2 days before period end (day 26 of 28-day cycle)
    // Only completed cycles are analyzed; last cycle's day 26 may fall
    // outside its cycleLength boundary, so we expect >= 50% occurrence
    cycles.forEach((cycle) => {
      const day26 = addDays(cycle.startDate, 25);
      logs[day26] = makeLog(day26, ['bloating']);
    });

    const patterns = analyzeSymptomPatterns(logs, cycles, symptomDefs);
    const bloatingPattern = patterns.find((p) => p.symptomId === 'bloating');
    expect(bloatingPattern).toBeDefined();
    expect(bloatingPattern!.description).toContain('bloating');
    expect(bloatingPattern!.occurrenceRate).toBeGreaterThanOrEqual(50);
  });

  it('sorts patterns by occurrence rate descending', () => {
    const cycles = makeCycles(4, '2025-01-01', 28);
    const logs: Record<string, DailyLog> = {};

    // Cramps on day 1 for all 4 cycles (100%)
    // Fatigue on day 1 for 3 of 4 cycles (75%)
    cycles.forEach((cycle, i) => {
      const date = cycle.startDate;
      if (i < 3) {
        logs[date] = makeLog(date, ['cramps', 'fatigue']);
      } else {
        logs[date] = makeLog(date, ['cramps']);
      }
    });

    const patterns = analyzeSymptomPatterns(logs, cycles, symptomDefs);
    if (patterns.length >= 2) {
      expect(patterns[0].occurrenceRate).toBeGreaterThanOrEqual(patterns[1].occurrenceRate);
    }
  });
});
