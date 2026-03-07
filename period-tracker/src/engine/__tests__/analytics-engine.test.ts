import { computeAnalytics } from '../analytics-engine';
import type { Cycle, DailyLog } from '../../models';

const symptomDefs = [
  { id: 'cramps', label: 'Cramps', icon: '⚡' },
  { id: 'headache', label: 'Headache', icon: '🤕' },
  { id: 'bloating', label: 'Bloating', icon: '🎈' },
];

const moodDefs = [
  { id: 'happy', label: 'Happy', icon: '😊' },
  { id: 'sad', label: 'Sad', icon: '😢' },
  { id: 'anxious', label: 'Anxious', icon: '😰' },
];

function makeCycles(count: number, cycleLength: number = 28, periodLength: number = 5): Cycle[] {
  const cycles: Cycle[] = [];
  let current = new Date('2025-01-01');
  for (let i = 0; i < count; i++) {
    const start = current.toISOString().split('T')[0];
    const next = new Date(current);
    next.setDate(next.getDate() + cycleLength);
    cycles.push({
      id: `cycle-${i}`,
      startDate: start,
      endDate: next.toISOString().split('T')[0],
      periodLength,
      cycleLength,
    });
    current = next;
  }
  return cycles;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

describe('computeAnalytics', () => {
  it('returns null for no completed cycles', () => {
    const cycles: Cycle[] = [{
      id: 'c1',
      startDate: '2025-01-01',
      periodLength: 5,
    }];
    const result = computeAnalytics({}, cycles, symptomDefs, moodDefs);
    expect(result).toBeNull();
  });

  it('computes period length stats', () => {
    const cycles: Cycle[] = [
      { id: 'c1', startDate: '2025-01-01', endDate: '2025-01-29', periodLength: 4, cycleLength: 28 },
      { id: 'c2', startDate: '2025-01-29', endDate: '2025-02-26', periodLength: 6, cycleLength: 28 },
      { id: 'c3', startDate: '2025-02-26', endDate: '2025-03-26', periodLength: 5, cycleLength: 28 },
    ];

    const result = computeAnalytics({}, cycles, symptomDefs, moodDefs);
    expect(result).not.toBeNull();
    expect(result!.avgPeriodLength).toBe(5);
    expect(result!.shortestPeriod).toBe(4);
    expect(result!.longestPeriod).toBe(6);
    expect(result!.cyclesAnalyzed).toBe(3);
  });

  it('counts top symptoms', () => {
    const cycles = makeCycles(3);
    const logs: Record<string, DailyLog> = {};

    // Add cramps on day 1-3 of each cycle, headache on day 1 only
    cycles.forEach((cycle) => {
      for (let d = 0; d < 3; d++) {
        const date = addDays(cycle.startDate, d);
        logs[date] = {
          date,
          symptoms: d === 0
            ? [{ symptomId: 'cramps', severity: 2 }, { symptomId: 'headache', severity: 1 }]
            : [{ symptomId: 'cramps', severity: 1 }],
          moods: [],
          updatedAt: new Date().toISOString(),
        };
      }
    });

    const result = computeAnalytics(logs, cycles, symptomDefs, moodDefs);
    expect(result).not.toBeNull();
    expect(result!.topSymptoms.length).toBeGreaterThanOrEqual(1);
    expect(result!.topSymptoms[0].symptomId).toBe('cramps');
    expect(result!.topSymptoms[0].count).toBe(9); // 3 days x 3 cycles
  });

  it('computes mood distribution', () => {
    const cycles = makeCycles(2);
    const logs: Record<string, DailyLog> = {};

    const d1 = cycles[0].startDate;
    const d2 = addDays(cycles[0].startDate, 1);
    logs[d1] = { date: d1, symptoms: [], moods: ['happy', 'anxious'], updatedAt: '' };
    logs[d2] = { date: d2, symptoms: [], moods: ['happy'], updatedAt: '' };

    const result = computeAnalytics(logs, cycles, symptomDefs, moodDefs);
    expect(result).not.toBeNull();
    const happyMood = result!.moodDistribution.find((m) => m.moodId === 'happy');
    expect(happyMood).toBeDefined();
    expect(happyMood!.count).toBe(2);
  });

  it('limits to specified cycle count', () => {
    const cycles = makeCycles(6);
    const result = computeAnalytics({}, cycles, symptomDefs, moodDefs, 3);
    expect(result).not.toBeNull();
    expect(result!.cyclesAnalyzed).toBe(3);
  });

  it('calculates cycle length variability', () => {
    const cycles: Cycle[] = [
      { id: 'c1', startDate: '2025-01-01', endDate: '2025-01-29', periodLength: 5, cycleLength: 28 },
      { id: 'c2', startDate: '2025-01-29', endDate: '2025-03-01', periodLength: 5, cycleLength: 31 },
      { id: 'c3', startDate: '2025-03-01', endDate: '2025-03-26', periodLength: 5, cycleLength: 25 },
    ];
    const result = computeAnalytics({}, cycles, symptomDefs, moodDefs);
    expect(result).not.toBeNull();
    expect(result!.cycleLengthVariability).toBeGreaterThan(0);
  });

  it('detects period length trend', () => {
    const cycles: Cycle[] = [
      { id: 'c1', startDate: '2025-01-01', endDate: '2025-01-29', periodLength: 3, cycleLength: 28 },
      { id: 'c2', startDate: '2025-01-29', endDate: '2025-02-26', periodLength: 3, cycleLength: 28 },
      { id: 'c3', startDate: '2025-02-26', endDate: '2025-03-26', periodLength: 5, cycleLength: 28 },
      { id: 'c4', startDate: '2025-03-26', endDate: '2025-04-23', periodLength: 6, cycleLength: 28 },
    ];
    const result = computeAnalytics({}, cycles, symptomDefs, moodDefs);
    expect(result).not.toBeNull();
    expect(result!.periodLengthTrend).toBe('longer');
  });
});
