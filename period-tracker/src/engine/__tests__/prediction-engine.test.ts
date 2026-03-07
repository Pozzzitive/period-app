import {
  weightedAverage,
  standardDeviation,
  getConfidence,
  predictNextPeriod,
  predictMultiplePeriods,
  shouldShowMissingPeriodPrompt,
} from '../prediction-engine';
import { parseISO } from 'date-fns';
import type { Cycle } from '../../models';

describe('weightedAverage', () => {
  it('returns default for empty array', () => {
    expect(weightedAverage([])).toBe(28);
  });

  it('returns the value itself for single element', () => {
    expect(weightedAverage([30])).toBe(30);
  });

  it('weights most recent cycle highest', () => {
    // [26, 28, 30] — most recent is 30, weight 0.4
    const result = weightedAverage([26, 28, 30]);
    // 30*0.4 + 28*0.3 + 26*0.15 = 12 + 8.4 + 3.9 = 24.3
    // total weight = 0.85
    // 24.3 / 0.85 = 28.588... → 29
    expect(result).toBe(29);
  });

  it('handles 6 cycles', () => {
    const result = weightedAverage([25, 27, 28, 30, 29, 28]);
    expect(result).toBeGreaterThanOrEqual(27);
    expect(result).toBeLessThanOrEqual(30);
  });

  it('handles more than 6 cycles (takes last 6)', () => {
    const result = weightedAverage([20, 22, 25, 27, 28, 30, 29, 28]);
    // Should only use last 6: [25, 27, 28, 30, 29, 28]
    expect(result).toBeGreaterThanOrEqual(27);
    expect(result).toBeLessThanOrEqual(30);
  });
});

describe('standardDeviation', () => {
  it('returns 0 for single value', () => {
    expect(standardDeviation([28])).toBe(0);
  });

  it('returns 0 for identical values', () => {
    expect(standardDeviation([28, 28, 28])).toBe(0);
  });

  it('calculates correctly for varied values', () => {
    const sd = standardDeviation([26, 28, 30]);
    // Sample stddev (n-1): sqrt(((26-28)²+(28-28)²+(30-28)²)/(3-1)) = sqrt(8/2) = 2.0
    expect(sd).toBeCloseTo(2.0, 2);
  });

  it('detects irregular cycles', () => {
    const sd = standardDeviation([22, 35, 28, 40, 25]);
    expect(sd).toBeGreaterThan(5);
  });
});

describe('getConfidence', () => {
  it('returns learning for 0-1 cycles', () => {
    expect(getConfidence(0, 0)).toBe('learning');
    expect(getConfidence(1, 0)).toBe('learning');
  });

  it('returns low for 2 cycles', () => {
    expect(getConfidence(2, 2)).toBe('low');
  });

  it('returns low for irregular cycles', () => {
    expect(getConfidence(6, 7)).toBe('low');
  });

  it('returns medium for 3-5 cycles', () => {
    expect(getConfidence(4, 2)).toBe('medium');
  });

  it('returns high for 6+ consistent cycles', () => {
    expect(getConfidence(6, 2)).toBe('high');
  });
});

describe('predictNextPeriod', () => {
  it('returns null for no cycles', () => {
    expect(predictNextPeriod([])).toBeNull();
  });

  it('uses typical length for first cycle', () => {
    const cycles: Cycle[] = [
      { id: 'c1', startDate: '2026-01-01', periodLength: 5 },
    ];
    const result = predictNextPeriod(cycles, 28, 5);
    expect(result).not.toBeNull();
    expect(result!.nextPeriodStart).toBe('2026-01-29');
    expect(result!.predictedCycleLength).toBe(28);
    expect(result!.confidence).toBe('learning');
  });

  it('uses weighted average with completed cycles', () => {
    const cycles: Cycle[] = [
      { id: 'c1', startDate: '2025-10-01', endDate: '2025-10-29', periodLength: 5, cycleLength: 28 },
      { id: 'c2', startDate: '2025-10-29', endDate: '2025-11-28', periodLength: 5, cycleLength: 30 },
      { id: 'c3', startDate: '2025-11-28', periodLength: 5 },
    ];
    const result = predictNextPeriod(cycles);
    expect(result).not.toBeNull();
    expect(result!.predictedCycleLength).toBeGreaterThanOrEqual(28);
    expect(result!.predictedCycleLength).toBeLessThanOrEqual(30);
  });

  it('calculates fertility window', () => {
    const cycles: Cycle[] = [
      { id: 'c1', startDate: '2026-02-01', periodLength: 5 },
    ];
    const result = predictNextPeriod(cycles, 28, 5);
    expect(result!.ovulationDate).toBeDefined();
    expect(result!.fertileWindowStart).toBeDefined();
    expect(result!.fertileWindowEnd).toBeDefined();
  });

  it('marks irregular cycles', () => {
    const cycles: Cycle[] = [
      { id: 'c1', startDate: '2025-08-01', endDate: '2025-08-22', periodLength: 5, cycleLength: 22 },
      { id: 'c2', startDate: '2025-08-22', endDate: '2025-09-27', periodLength: 5, cycleLength: 36 },
      { id: 'c3', startDate: '2025-09-27', endDate: '2025-10-22', periodLength: 5, cycleLength: 25 },
      { id: 'c4', startDate: '2025-10-22', periodLength: 5 },
    ];
    const result = predictNextPeriod(cycles);
    expect(result!.isIrregular).toBe(true);
    expect(result!.confidence).toBe('low');
    expect(result!.windowDays).toBeDefined();
  });

  it('handles very short cycles', () => {
    const cycles: Cycle[] = [
      { id: 'c1', startDate: '2026-01-01', endDate: '2026-01-22', periodLength: 3, cycleLength: 21 },
      { id: 'c2', startDate: '2026-01-22', periodLength: 3 },
    ];
    const result = predictNextPeriod(cycles, 21, 3);
    expect(result!.predictedCycleLength).toBe(21);
  });

  it('handles very long cycles', () => {
    const cycles: Cycle[] = [
      { id: 'c1', startDate: '2025-11-01', endDate: '2025-12-16', periodLength: 7, cycleLength: 45 },
      { id: 'c2', startDate: '2025-12-16', periodLength: 7 },
    ];
    const result = predictNextPeriod(cycles, 45, 7);
    expect(result!.predictedCycleLength).toBe(45);
  });
});

describe('shouldShowMissingPeriodPrompt', () => {
  it('returns false when no prediction', () => {
    expect(shouldShowMissingPeriodPrompt(null, '2026-02-01', [])).toBe(false);
  });

  it('returns false when less than 7 days past prediction', () => {
    const prediction = {
      nextPeriodStart: '2026-02-01',
      nextPeriodEnd: '2026-02-05',
      predictedCycleLength: 28,
      predictedPeriodLength: 5,
      confidence: 'medium' as const,
      isIrregular: false,
    };
    expect(shouldShowMissingPeriodPrompt(prediction, '2026-02-05', [])).toBe(false);
  });

  it('returns true when 7+ days past and no period logged', () => {
    const prediction = {
      nextPeriodStart: '2026-02-01',
      nextPeriodEnd: '2026-02-05',
      predictedCycleLength: 28,
      predictedPeriodLength: 5,
      confidence: 'medium' as const,
      isIrregular: false,
    };
    expect(shouldShowMissingPeriodPrompt(prediction, '2026-02-09', [])).toBe(true);
  });

  it('returns false when period is logged after prediction', () => {
    const prediction = {
      nextPeriodStart: '2026-02-01',
      nextPeriodEnd: '2026-02-05',
      predictedCycleLength: 28,
      predictedPeriodLength: 5,
      confidence: 'medium' as const,
      isIrregular: false,
    };
    expect(shouldShowMissingPeriodPrompt(prediction, '2026-02-09', ['2026-02-03'])).toBe(false);
  });
});

describe('predictMultiplePeriods', () => {
  // Use a fixed reference date so predictions aren't skipped as "past"
  const ref = parseISO('2026-01-01');

  it('returns empty array for 0 count', () => {
    const cycles: Cycle[] = [
      { id: 'c1', startDate: '2026-01-01', periodLength: 5 },
    ];
    expect(predictMultiplePeriods(cycles, 0)).toEqual([]);
  });

  it('returns empty array for no cycles', () => {
    expect(predictMultiplePeriods([], 3)).toEqual([]);
  });

  it('returns correct number of predictions', () => {
    const cycles: Cycle[] = [
      { id: 'c1', startDate: '2026-01-01', periodLength: 5 },
    ];
    const result = predictMultiplePeriods(cycles, 3, 28, 5, ref);
    expect(result).toHaveLength(3);
    expect(result[0].cycleNumber).toBe(1);
    expect(result[1].cycleNumber).toBe(2);
    expect(result[2].cycleNumber).toBe(3);
  });

  it('chains predictions correctly with default cycle length', () => {
    const cycles: Cycle[] = [
      { id: 'c1', startDate: '2026-01-01', periodLength: 5 },
    ];
    const result = predictMultiplePeriods(cycles, 3, 28, 5, ref);
    // First prediction: Jan 1 + 28 = Jan 29
    expect(result[0].startDate).toBe('2026-01-29');
    // Second: Jan 29 + 28 = Feb 26
    expect(result[1].startDate).toBe('2026-02-26');
    // Third: Feb 26 + 28 = Mar 26
    expect(result[2].startDate).toBe('2026-03-26');
  });

  it('calculates end dates as periodLength - 1 days after start', () => {
    const cycles: Cycle[] = [
      { id: 'c1', startDate: '2026-01-01', periodLength: 5 },
    ];
    const result = predictMultiplePeriods(cycles, 2, 28, 5, ref);
    // Start Jan 29, end Jan 29 + 4 = Feb 2
    expect(result[0].startDate).toBe('2026-01-29');
    expect(result[0].endDate).toBe('2026-02-02');
    expect(result[1].startDate).toBe('2026-02-26');
    expect(result[1].endDate).toBe('2026-03-02');
  });

  it('uses weighted average cycle length when cycles have history', () => {
    const cycles: Cycle[] = [
      { id: 'c1', startDate: '2025-10-01', endDate: '2025-10-31', periodLength: 5, cycleLength: 30 },
      { id: 'c2', startDate: '2025-10-31', endDate: '2025-11-30', periodLength: 5, cycleLength: 30 },
      { id: 'c3', startDate: '2025-11-30', periodLength: 5 },
    ];
    const refDate = parseISO('2025-11-30');
    const result = predictMultiplePeriods(cycles, 2, 28, 5, refDate);
    // Weighted average of [30, 30] = 30
    expect(result[0].startDate).toBe('2025-12-30');
    expect(result[1].startDate).toBe('2026-01-29');
  });

  it('returns single prediction for count of 1', () => {
    const cycles: Cycle[] = [
      { id: 'c1', startDate: '2026-01-01', periodLength: 5 },
    ];
    const result = predictMultiplePeriods(cycles, 1, 28, 5, ref);
    expect(result).toHaveLength(1);
    expect(result[0].cycleNumber).toBe(1);
  });

  it('includes cycleLength and periodLength in each prediction', () => {
    const cycles: Cycle[] = [
      { id: 'c1', startDate: '2026-01-01', periodLength: 4 },
    ];
    const result = predictMultiplePeriods(cycles, 2, 30, 4, ref);
    for (const p of result) {
      expect(p.cycleLength).toBe(30);
      expect(p.periodLength).toBe(4);
    }
  });

  it('skips past predictions and returns future ones', () => {
    const cycles: Cycle[] = [
      { id: 'c1', startDate: '2025-06-01', periodLength: 5 },
    ];
    // Reference date far in the future — should skip many cycles
    const futureRef = parseISO('2026-03-01');
    const result = predictMultiplePeriods(cycles, 2, 28, 5, futureRef);
    expect(result).toHaveLength(2);
    // All predictions should be on or after the reference date
    expect(result[0].startDate >= '2026-03-01').toBe(true);
    expect(result[1].startDate > result[0].startDate).toBe(true);
  });

  it('ignores implausibly short cycles and falls back to typical length', () => {
    const cycles: Cycle[] = [
      { id: 'c1', startDate: '2026-01-01', endDate: '2026-01-03', periodLength: 2, cycleLength: 2 },
      { id: 'c2', startDate: '2026-01-03', periodLength: 2 },
    ];
    const result = predictMultiplePeriods(cycles, 2, 28, 5, ref);
    // cycleLength 2 is below MIN_CYCLE_LENGTH and gets filtered out;
    // falls back to typicalCycleLength (28)
    expect(result[0].cycleLength).toBe(28);
  });
});
