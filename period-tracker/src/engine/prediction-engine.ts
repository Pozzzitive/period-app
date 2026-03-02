import { differenceInDays, addDays, parseISO, format } from 'date-fns';
import type { Cycle, PredictionResult, ConfidenceLevel } from '../models';
import { DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH } from '../constants/phases';

// Weights for rolling weighted average (most recent first)
const CYCLE_WEIGHTS = [0.4, 0.3, 0.15, 0.1, 0.05];
const MAX_CYCLES_FOR_PREDICTION = 6;

/**
 * Calculate weighted average of cycle lengths.
 * Most recent cycle gets highest weight.
 */
export function weightedAverage(values: number[]): number {
  if (values.length === 0) return DEFAULT_CYCLE_LENGTH;
  if (values.length === 1) return values[0];

  // Take most recent cycles (up to MAX_CYCLES_FOR_PREDICTION)
  const recent = values.slice(-MAX_CYCLES_FOR_PREDICTION);
  // Reverse so most recent is first
  const reversed = [...recent].reverse();

  let totalWeight = 0;
  let weightedSum = 0;

  for (let i = 0; i < reversed.length; i++) {
    const weight = CYCLE_WEIGHTS[i] ?? CYCLE_WEIGHTS[CYCLE_WEIGHTS.length - 1];
    weightedSum += reversed[i] * weight;
    totalWeight += weight;
  }

  return Math.round(weightedSum / totalWeight);
}

/**
 * Calculate standard deviation of cycle lengths.
 */
export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => (v - mean) ** 2);
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Determine prediction confidence based on cycle count and regularity.
 */
export function getConfidence(completedCycles: number, stddev: number): ConfidenceLevel {
  if (completedCycles < 2) return 'learning';
  if (completedCycles < 3) return 'low';
  if (stddev > 5) return 'low';
  if (completedCycles < 6) return 'medium';
  if (stddev <= 3) return 'high';
  return 'medium';
}

/**
 * Predict next period and fertility window from logged cycles.
 */
export function predictNextPeriod(
  cycles: Cycle[],
  typicalCycleLength: number = DEFAULT_CYCLE_LENGTH,
  typicalPeriodLength: number = DEFAULT_PERIOD_LENGTH
): PredictionResult | null {
  if (cycles.length === 0) return null;

  // Get completed cycles (those with known cycle length)
  const completedCycles = cycles.filter((c) => c.cycleLength != null);
  const cycleLengths = completedCycles.map((c) => c.cycleLength!);
  const periodLengths = cycles.map((c) => c.periodLength);

  // Calculate predicted lengths
  const predictedCycleLength =
    cycleLengths.length > 0
      ? weightedAverage(cycleLengths)
      : typicalCycleLength;

  const predictedPeriodLength =
    periodLengths.length > 0
      ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
      : typicalPeriodLength;

  // Get the most recent cycle's start date
  const lastCycle = cycles[cycles.length - 1];
  const lastPeriodStart = parseISO(lastCycle.startDate);

  // Predict next period start
  const nextStart = addDays(lastPeriodStart, predictedCycleLength);
  const nextEnd = addDays(nextStart, predictedPeriodLength - 1);

  // Calculate confidence
  const stddev = standardDeviation(cycleLengths);
  const confidence = getConfidence(completedCycles.length, stddev);
  const isIrregular = stddev > 5;

  // Calculate fertility window
  // Ovulation = cycle length - 14 (calendar method)
  const ovulationDayInCycle = predictedCycleLength - 14;
  const ovulationDate = addDays(lastPeriodStart, ovulationDayInCycle);
  const fertileWindowStart = addDays(ovulationDate, -5);
  const fertileWindowEnd = ovulationDate; // ovulation day itself

  const result: PredictionResult = {
    nextPeriodStart: format(nextStart, 'yyyy-MM-dd'),
    nextPeriodEnd: format(nextEnd, 'yyyy-MM-dd'),
    predictedCycleLength,
    predictedPeriodLength,
    confidence,
    fertileWindowStart: format(fertileWindowStart, 'yyyy-MM-dd'),
    fertileWindowEnd: format(fertileWindowEnd, 'yyyy-MM-dd'),
    ovulationDate: format(ovulationDate, 'yyyy-MM-dd'),
    isIrregular,
  };

  // For irregular cycles, add window size
  if (isIrregular) {
    result.windowDays = Math.ceil(stddev);
  }

  return result;
}

/**
 * Check if a "missing period" prompt should be shown.
 * Trigger: today > predicted start + 7 days AND no period logged.
 */
export function shouldShowMissingPeriodPrompt(
  prediction: PredictionResult | null,
  todayStr: string,
  periodsAfterPrediction: string[] // start dates of periods logged after predicted date
): boolean {
  if (!prediction) return false;

  const today = parseISO(todayStr);
  const predictedStart = parseISO(prediction.nextPeriodStart);
  const daysPastPrediction = differenceInDays(today, predictedStart);

  // Only trigger if 7+ days past prediction
  if (daysPastPrediction < 7) return false;

  // Don't trigger if there's a period logged after the predicted date
  return periodsAfterPrediction.length === 0;
}
