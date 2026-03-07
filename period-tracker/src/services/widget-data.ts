import { storage } from '../storage';
import { useCycleStore } from '../stores/cycle-store';
import { useUserStore } from '../stores/user-store';
import { useSubscriptionStore } from '../stores/subscription-store';
import { predictNextPeriod } from '../engine/prediction-engine';
import { calculatePhase } from '../engine/phase-calculator';
import { PHASES } from '../constants/phases';
import type { CyclePhase } from '../constants/phases';
import { differenceInDays, parseISO } from 'date-fns';

export interface WidgetData {
  daysUntilNextPeriod: number | null;
  currentPhase: string | null;
  phaseColor: string | null;
  cycleDay: number | null;
  cycleLength: number | null;
  periodLength: number | null;
  nextPeriodDate: string | null;
  isPremiumPlus: boolean;
  lastUpdated: string;
}

const WIDGET_DATA_KEY = 'widget-data';

export function computeWidgetData(): WidgetData {
  const { cycles } = useCycleStore.getState();
  const { profile } = useUserStore.getState();
  const today = new Date().toISOString().split('T')[0];

  const prediction = predictNextPeriod(
    cycles,
    profile.typicalCycleLength,
    profile.typicalPeriodLength,
  );

  let daysUntilNextPeriod: number | null = null;
  let nextPeriodDate: string | null = null;
  if (prediction) {
    const rawDays = differenceInDays(parseISO(prediction.nextPeriodStart), parseISO(today));
    // Clamp to 0 — negative means the predicted date is past (period is late)
    daysUntilNextPeriod = Math.max(rawDays, 0);
    nextPeriodDate = prediction.nextPeriodStart;
  }

  let currentPhase: string | null = null;
  let phaseColor: string | null = null;
  let cycleDay: number | null = null;
  let cycleLength: number | null = null;
  let periodLength: number | null = null;

  const lastCycle = cycles[cycles.length - 1];
  if (lastCycle) {
    cycleLength = lastCycle.cycleLength ?? profile.typicalCycleLength;
    periodLength = lastCycle.periodLength ?? profile.typicalPeriodLength;
    const phase = calculatePhase(
      today,
      lastCycle.startDate,
      cycleLength,
      lastCycle.periodLength,
    );
    if (phase) {
      currentPhase = PHASES[phase.phase as CyclePhase]?.label ?? null;
      phaseColor = PHASES[phase.phase as CyclePhase]?.color ?? null;
      cycleDay = phase.dayInCycle;
    }
  }

  const subState = useSubscriptionStore.getState();
  const isPremiumPlus = subState.subscription.tier === 'premium_plus' && subState.subscription.isActive;

  const widgetData: WidgetData = {
    daysUntilNextPeriod,
    currentPhase,
    phaseColor,
    cycleDay,
    cycleLength,
    periodLength,
    nextPeriodDate,
    isPremiumPlus,
    lastUpdated: new Date().toISOString(),
  };

  // Persist to MMKV for future native widget access
  storage.set(WIDGET_DATA_KEY, JSON.stringify(widgetData));

  return widgetData;
}

export function getStoredWidgetData(): WidgetData | null {
  const raw = storage.getString(WIDGET_DATA_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WidgetData;
  } catch {
    return null;
  }
}
