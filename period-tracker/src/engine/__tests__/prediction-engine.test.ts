import {
  weightedAverage,
  standardDeviation,
  getConfidence,
  predictNextPeriod,
  shouldShowMissingPeriodPrompt,
} from '../prediction-engine';
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
    expect(sd).toBeCloseTo(1.633, 2);
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
