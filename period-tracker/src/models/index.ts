import type { CyclePhase } from '../constants/phases';

// ============================================================
// Core Data Types
// ============================================================

/** A logged menstrual period */
export interface Period {
  id: string;
  startDate: string; // ISO date string YYYY-MM-DD
  endDate?: string;  // ISO date string YYYY-MM-DD, undefined if period is ongoing
}

/** A calculated cycle derived from period data */
export interface Cycle {
  id: string;
  startDate: string;   // first day of period
  endDate?: string;     // day before next period starts (undefined if current cycle)
  periodLength: number; // days of bleeding
  cycleLength?: number; // total days (only known when next period starts)
}

/** Flow intensity level */
export type FlowIntensity = 'spotting' | 'light' | 'medium' | 'heavy';

/** Symptom entry with severity */
export interface SymptomEntry {
  symptomId: string;
  severity: 1 | 2 | 3; // 1=mild, 2=moderate, 3=severe
}

/** Intercourse log entry */
export interface IntercourseEntry {
  logged: boolean;
  protected?: boolean;
  notes?: string;
}

/** Daily log for a specific date */
export interface DailyLog {
  date: string; // ISO date string YYYY-MM-DD
  flow?: FlowIntensity;
  symptoms: SymptomEntry[];
  moods: string[]; // mood IDs
  intercourse?: IntercourseEntry;
  notes?: string;
  updatedAt: string; // ISO datetime
}

// ============================================================
// Prediction Types
// ============================================================

export type ConfidenceLevel = 'learning' | 'low' | 'medium' | 'high';

export interface PredictionResult {
  nextPeriodStart: string;       // predicted start date
  nextPeriodEnd: string;         // predicted end date
  predictedCycleLength: number;
  predictedPeriodLength: number;
  confidence: ConfidenceLevel;
  fertileWindowStart?: string;
  fertileWindowEnd?: string;
  ovulationDate?: string;
  isIrregular: boolean;
  windowDays?: number;           // for irregular cycles, how many days the prediction window spans
}

export interface PhaseInfo {
  phase: CyclePhase;
  dayInPhase: number;
  dayInCycle: number;
  totalPhaseDays: number;
  cycleLength: number;
}

// ============================================================
// User Profile & Settings
// ============================================================

export interface UserProfile {
  birthYear?: number;
  isTeenager: boolean;
  typicalCycleLength: number;
  typicalPeriodLength: number;
  lastPeriodStartDate?: string;
  healthConditions: string[]; // condition IDs
  onboardingCompleted: boolean;
  onboardingCompletedAt?: string;
  createdAt: string;
}

export interface NotificationSettings {
  periodReminder: boolean;      // 5 days before
  periodStarting: boolean;      // day of predicted start
  premenstrualPhase: boolean;   // entry into PMS window
  fertileWindowOpen: boolean;   // 5 days before ovulation
  peakFertility: boolean;       // ovulation day
  lowFertility: boolean;        // late luteal
  dailyLogReminder: boolean;    // configurable time
  dailyLogReminderTime?: string; // HH:mm
  cycleSummary: boolean;        // day after period ends
  pillReminder: boolean;        // daily
  pillReminderTime?: string;    // HH:mm
  contraceptionReminder: boolean;
}

export interface AppLockSettings {
  enabled: boolean;
  method: 'biometric' | 'pin' | 'both';
  timeoutMinutes: 1 | 5 | 15;
}

export interface AppSettings {
  notifications: NotificationSettings;
  appLock: AppLockSettings;
  fertilityTrackingEnabled: boolean;
  partnerSharingEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  gdprConsentGiven: boolean;
  gdprConsentDate?: string;
  dataCategories: {
    cycleData: boolean;
    symptoms: boolean;
    intercourse: boolean;
  };
}

// ============================================================
// Subscription
// ============================================================

export type SubscriptionTier = 'base' | 'premium_plus';
export type SubscriptionPeriod = 'monthly' | 'yearly';

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  isActive: boolean;
  expiresAt?: string;
  purchasedAt?: string;
  period?: SubscriptionPeriod;
  productId?: string;
}

// ============================================================
// Missing Period Prompt
// ============================================================

export type MissingPeriodResponse =
  | 'log_period'
  | 'late_waiting'
  | 'forgot_to_log'
  | 'skip_cycle';

// ============================================================
// Partner Sharing
// ============================================================

export interface PartnerShareData {
  nextPeriodDate?: string;
  currentPhase?: string;
  fertileWindow?: {
    start: string;
    end: string;
  };
  cycleDay?: number;
  generatedAt: string;
}
