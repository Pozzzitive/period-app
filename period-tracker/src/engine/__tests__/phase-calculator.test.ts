import { calculatePhase, getCyclePhaseRanges } from '../phase-calculator';

describe('calculatePhase', () => {
  const cycleStart = '2026-02-01';

  it('returns menstruation for first few days', () => {
    const phase = calculatePhase('2026-02-01', cycleStart, 28, 5);
    expect(phase).not.toBeNull();
    expect(phase!.phase).toBe('menstruation');
    expect(phase!.dayInCycle).toBe(1);
    expect(phase!.dayInPhase).toBe(1);
  });

  it('returns menstruation for day 5', () => {
    const phase = calculatePhase('2026-02-05', cycleStart, 28, 5);
    expect(phase!.phase).toBe('menstruation');
    expect(phase!.dayInCycle).toBe(5);
  });

  it('returns follicular after period ends', () => {
    const phase = calculatePhase('2026-02-06', cycleStart, 28, 5);
    expect(phase!.phase).toBe('follicular');
  });

  it('returns ovulation around day 14', () => {
    const phase = calculatePhase('2026-02-14', cycleStart, 28, 5);
    expect(phase!.phase).toBe('ovulation');
  });

  it('returns luteal in the middle-late phase', () => {
    const phase = calculatePhase('2026-02-18', cycleStart, 28, 5);
    expect(phase!.phase).toBe('luteal');
  });

  it('returns premenstrual in last 5 days', () => {
    const phase = calculatePhase('2026-02-26', cycleStart, 28, 5);
    expect(phase!.phase).toBe('premenstrual');
  });

  it('returns null for dates outside cycle', () => {
    expect(calculatePhase('2026-01-31', cycleStart, 28, 5)).toBeNull();
    expect(calculatePhase('2026-03-02', cycleStart, 28, 5)).toBeNull();
  });

  it('scales to shorter cycles (21 days)', () => {
    const phase = calculatePhase('2026-02-01', cycleStart, 21, 3);
    expect(phase!.phase).toBe('menstruation');

    const late = calculatePhase('2026-02-20', cycleStart, 21, 3);
    expect(late!.phase).toBe('premenstrual');
  });

  it('scales to longer cycles (35 days)', () => {
    const phase = calculatePhase('2026-02-01', cycleStart, 35, 6);
    expect(phase!.phase).toBe('menstruation');

    const mid = calculatePhase('2026-02-15', cycleStart, 35, 6);
    expect(mid!.phase).toBe('follicular');
  });
});

describe('getCyclePhaseRanges', () => {
  it('returns 5 phases for standard cycle', () => {
    const ranges = getCyclePhaseRanges('2026-02-01', 28, 5);
    expect(ranges.length).toBe(5);
    expect(ranges[0].phase).toBe('menstruation');
    expect(ranges[4].phase).toBe('premenstrual');
  });

  it('phases cover the full cycle without gaps', () => {
    const ranges = getCyclePhaseRanges('2026-02-01', 28, 5);
    // Check all days 1-28 are covered
    for (let day = 1; day <= 28; day++) {
      const covered = ranges.some((r) => day >= r.startDay && day <= r.endDay);
      expect(covered).toBe(true);
    }
  });
});
