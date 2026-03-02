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

  it('returns null for dates before cycle start', () => {
    expect(calculatePhase('2026-01-31', cycleStart, 28, 5)).toBeNull();
  });

  it('returns null for dates past cycle end without effectiveCycleLength', () => {
    expect(calculatePhase('2026-03-02', cycleStart, 28, 5)).toBeNull();
  });

  it('stretches phases proportionally with effectiveCycleLength', () => {
    // 28-day cycle stretched to 32 → effectiveLength=32
    // ovulationDay = max(32-14, 7) = 18, pmsStart = max(32-4, 20) = 28
    // Phases: menst 1-5, foll 6-17, ovul 18-19, lut 20-27, pms 28-32

    // Day 15 is now follicular (was ovulation in a 28-day cycle)
    const mid = calculatePhase('2026-02-15', cycleStart, 28, 5, 32);
    expect(mid).not.toBeNull();
    expect(mid!.phase).toBe('follicular');

    // Day 32 is PMS
    const late = calculatePhase('2026-03-04', cycleStart, 28, 5, 32);
    expect(late).not.toBeNull();
    expect(late!.phase).toBe('premenstrual');
    expect(late!.dayInCycle).toBe(32);
    expect(late!.dayInPhase).toBe(5); // 32 - 28 + 1
    expect(late!.cycleLength).toBe(28); // preserves original
  });

  it('returns null for days past effectiveCycleLength', () => {
    // effectiveCycleLength=30, day 31 should be null
    expect(calculatePhase('2026-03-03', cycleStart, 28, 5, 30)).toBeNull();
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

  it('default lateDays=0 does not change ranges', () => {
    const rangesDefault = getCyclePhaseRanges('2026-02-01', 28, 5);
    const rangesExplicit = getCyclePhaseRanges('2026-02-01', 28, 5, 0);
    expect(rangesDefault).toEqual(rangesExplicit);
    const pms = rangesDefault.find((r) => r.phase === 'premenstrual')!;
    expect(pms.endDay).toBe(28);
  });

  it('lateDays stretches all phases proportionally', () => {
    // 28-day cycle + 4 late days → effectiveLength=32
    // ovulationDay = max(32-14, 7) = 18
    // pmsStart = max(32-4, 20) = 28
    const ranges = getCyclePhaseRanges('2026-02-01', 28, 5, 4);

    const menst = ranges.find((r) => r.phase === 'menstruation')!;
    expect(menst.endDay).toBe(5); // period length stays fixed

    const foll = ranges.find((r) => r.phase === 'follicular')!;
    expect(foll.startDay).toBe(6);
    expect(foll.endDay).toBe(17); // stretched from 13 to 17

    const ovul = ranges.find((r) => r.phase === 'ovulation')!;
    expect(ovul.startDay).toBe(18); // shifted from 14 to 18

    const lut = ranges.find((r) => r.phase === 'luteal')!;
    expect(lut.startDay).toBe(20);
    expect(lut.endDay).toBe(27);

    const pms = ranges.find((r) => r.phase === 'premenstrual')!;
    expect(pms.startDay).toBe(28);
    expect(pms.endDay).toBe(32);
  });

  it('lateDays ranges cover all days without gaps', () => {
    const ranges = getCyclePhaseRanges('2026-02-01', 28, 5, 4);
    for (let day = 1; day <= 32; day++) {
      const covered = ranges.some((r) => day >= r.startDay && day <= r.endDay);
      expect(covered).toBe(true);
    }
  });
});
