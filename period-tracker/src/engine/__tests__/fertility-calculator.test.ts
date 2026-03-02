import { calculateFertilityWindow, getFertilityLevel } from '../fertility-calculator';

describe('calculateFertilityWindow', () => {
  it('calculates for standard 28-day cycle', () => {
    const window = calculateFertilityWindow('2026-02-01', 28);
    expect(window.ovulationDate).toBe('2026-02-14');
    expect(window.fertileEnd).toBe('2026-02-14'); // ovulation day
    expect(window.fertileStart).toBe('2026-02-09'); // 5 days before
  });

  it('calculates for shorter cycle (21 days)', () => {
    const window = calculateFertilityWindow('2026-02-01', 21);
    expect(window.ovulationDate).toBe('2026-02-07');
  });

  it('calculates for longer cycle (35 days)', () => {
    const window = calculateFertilityWindow('2026-02-01', 35);
    expect(window.ovulationDate).toBe('2026-02-21');
  });
});

describe('getFertilityLevel', () => {
  const window = calculateFertilityWindow('2026-02-01', 28);

  it('returns peak for ovulation day', () => {
    expect(getFertilityLevel('2026-02-14', window)).toBe('peak');
  });

  it('returns peak for day before ovulation', () => {
    expect(getFertilityLevel('2026-02-13', window)).toBe('peak');
  });

  it('returns high for fertile window days', () => {
    expect(getFertilityLevel('2026-02-10', window)).toBe('high');
  });

  it('returns low for non-fertile days', () => {
    expect(getFertilityLevel('2026-02-03', window)).toBe('low');
    expect(getFertilityLevel('2026-02-20', window)).toBe('low');
  });

  it('returns none when no window provided', () => {
    expect(getFertilityLevel('2026-02-10', null)).toBe('none');
  });
});
