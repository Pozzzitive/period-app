import * as Notifications from 'expo-notifications';
import { addDays, parseISO } from 'date-fns';
import type {
  PredictionResult,
  NotificationSettings,
  FertilityIntent,
} from '../models';

// Notification category identifiers
const NOTIF_IDS = {
  PERIOD_REMINDER: 'period-reminder',
  PERIOD_STARTING: 'period-starting',
  PREMENSTRUAL: 'premenstrual',
  FERTILE_WINDOW: 'fertile-window',
  PEAK_FERTILITY: 'peak-fertility',
  LOW_FERTILITY: 'low-fertility',
  DAILY_LOG: 'daily-log',
  CYCLE_SUMMARY: 'cycle-summary',
  CONTRACEPTION: 'contraception',
};

/** Legacy preset → HH:mm mapping for migration */
const LEGACY_PRESETS: Record<string, string> = {
  morning: '09:00',
  noon: '13:00',
  evening: '20:00',
};

/**
 * Parse a cycle notification time (HH:mm string, or legacy preset name).
 * Returns { hour, minute }.
 */
function parseCycleNotifTime(time: string): { hour: number; minute: number } {
  // Handle legacy preset values
  const resolved = LEGACY_PRESETS[time] ?? time;
  const [h, m] = resolved.split(':').map(Number);
  return {
    hour: isNaN(h) ? 9 : h,
    minute: isNaN(m) ? 0 : m,
  };
}

// Discreet notification text — generic, privacy-safe language
const DISCREET_TITLE = 'Reminder';
const DISCREET_BODY = 'Open the app to check your update.';
const DISCREET_DAILY = 'Time for your daily check-in.';
const DISCREET_MED = 'Time for your reminder.';

/**
 * Request notification permissions.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Cancel all scheduled notifications.
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Schedule all cycle-related notifications based on prediction and settings.
 * Call this whenever the user logs a period or changes settings.
 */
export async function scheduleNotifications(
  prediction: PredictionResult | null,
  settings: NotificationSettings,
  isTeenager: boolean
): Promise<void> {
  // Cancel existing notifications first
  await cancelAllNotifications();

  // Only check current permission status — don't trigger the OS prompt.
  // Permission is requested explicitly during onboarding or settings.
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  const now = new Date();
  const cycleTime = settings.cycleNotificationTime ?? '09:00';
  const { hour: cycleHour, minute: cycleMinute } = parseCycleNotifTime(cycleTime);
  const discreet = settings.discreetNotifications ?? true;

  if (prediction) {
    const nextStart = parseISO(prediction.nextPeriodStart);
    const nextEnd = parseISO(prediction.nextPeriodEnd);

    // Period reminder (5 days before)
    if (settings.periodReminder) {
      const reminderDate = addDays(nextStart, -5);
      if (reminderDate > now) {
        await safeScheduleDate(
          NOTIF_IDS.PERIOD_REMINDER,
          discreet ? DISCREET_TITLE : 'Period Reminder',
          discreet ? DISCREET_BODY : 'Your period is estimated to start in 5 days. How are you feeling?',
          setTimeOnDate(reminderDate, cycleHour, cycleMinute)
        );
      }
    }

    // Period starting (day of)
    if (settings.periodStarting) {
      if (nextStart > now) {
        await safeScheduleDate(
          NOTIF_IDS.PERIOD_STARTING,
          discreet ? DISCREET_TITLE : 'Period Starting',
          discreet ? DISCREET_BODY : "Your period may start today. Don't forget to log it when it begins.",
          setTimeOnDate(nextStart, cycleHour, cycleMinute)
        );
      }
    }

    // Premenstrual phase (6 days before, avoids overlap with period reminder at -5)
    if (settings.premenstrualPhase) {
      const pmsDate = addDays(nextStart, -6);
      if (pmsDate > now) {
        await safeScheduleDate(
          NOTIF_IDS.PREMENSTRUAL,
          discreet ? DISCREET_TITLE : 'Premenstrual Phase',
          discreet ? DISCREET_BODY : "You're entering the premenstrual phase. PMS symptoms like mood changes and bloating are common right now.",
          setTimeOnDate(pmsDate, cycleHour, cycleMinute)
        );
      }
    }

    // Cycle summary (day after period ends)
    if (settings.cycleSummary) {
      const summaryDate = addDays(nextEnd, 1);
      if (summaryDate > now) {
        await safeScheduleDate(
          NOTIF_IDS.CYCLE_SUMMARY,
          discreet ? DISCREET_TITLE : 'Cycle Summary',
          discreet ? DISCREET_BODY : 'Your period has ended. Check your cycle summary and insights.',
          setTimeOnDate(summaryDate, cycleHour, cycleMinute)
        );
      }
    }

    // Fertility notifications (skip for teenagers and 'none' intent)
    const intent: FertilityIntent = settings.fertilityIntent ?? 'none';

    if (!isTeenager && intent !== 'none') {
      // Fertile window
      if (settings.fertileWindowOpen && prediction.fertileWindowStart) {
        const fertileDate = parseISO(prediction.fertileWindowStart);
        if (fertileDate > now) {
          let body: string;
          if (discreet) {
            body = DISCREET_BODY;
          } else {
            body = intent === 'conceive'
              ? 'Your fertile window begins today — this is a great time to try!'
              : 'Your fertile window begins today — be extra careful if you want to avoid pregnancy.';
          }
          await safeScheduleDate(
            NOTIF_IDS.FERTILE_WINDOW,
            discreet ? DISCREET_TITLE : 'Fertile Window',
            body,
            setTimeOnDate(fertileDate, cycleHour, cycleMinute)
          );
        }
      }

      // Peak fertility
      if (settings.peakFertility && prediction.ovulationDate) {
        const ovulationDate = parseISO(prediction.ovulationDate);
        if (ovulationDate > now) {
          let body: string;
          if (discreet) {
            body = DISCREET_BODY;
          } else {
            body = intent === 'conceive'
              ? 'Today is your estimated ovulation day — your best chance to conceive!'
              : 'Today is your estimated ovulation day — highest risk of pregnancy. Use protection if needed.';
          }
          await safeScheduleDate(
            NOTIF_IDS.PEAK_FERTILITY,
            discreet ? DISCREET_TITLE : 'Peak Fertility',
            body,
            setTimeOnDate(ovulationDate, cycleHour, cycleMinute)
          );
        }
      }

      // Low fertility (2 days after ovulation)
      if (settings.lowFertility && prediction.ovulationDate) {
        const lowFertDate = addDays(parseISO(prediction.ovulationDate), 2);
        if (lowFertDate > now) {
          let body: string;
          if (discreet) {
            body = DISCREET_BODY;
          } else {
            body = intent === 'conceive'
              ? 'You have likely passed your fertile window for this cycle.'
              : 'Your fertile window has likely passed — lower chance of pregnancy for the rest of this cycle.';
          }
          await safeScheduleDate(
            NOTIF_IDS.LOW_FERTILITY,
            discreet ? DISCREET_TITLE : 'Low Fertility',
            body,
            setTimeOnDate(lowFertDate, cycleHour, cycleMinute)
          );
        }
      }
    }
  }

  // Daily log reminder
  if (settings.dailyLogReminder) {
    const { hour: dlHour, minute: dlMinute } = parseTime(settings.dailyLogReminderTime ?? '21:00');
    await safeScheduleDaily(
      NOTIF_IDS.DAILY_LOG,
      discreet ? DISCREET_TITLE : 'Daily Log Reminder',
      discreet ? DISCREET_DAILY : 'How was your day? Take a moment to log your symptoms and mood.',
      dlHour,
      dlMinute
    );
  }

  // Contraception reminder (daily at user-chosen time)
  if (settings.contraceptionReminder) {
    const { hour: crHour, minute: crMinute } = parseTime(settings.contraceptionReminderTime ?? '09:00');
    await safeScheduleDaily(
      NOTIF_IDS.CONTRACEPTION,
      discreet ? DISCREET_TITLE : 'Contraception Reminder',
      discreet ? DISCREET_MED : 'Time for your contraception — patch, ring, or injection check.',
      crHour,
      crMinute
    );
  }

  // Medication reminders (one daily notification per enabled medication)
  for (const med of (settings.medications ?? [])) {
    if (med.enabled) {
      const { hour: medHour, minute: medMinute } = parseTime(med.time);
      await safeScheduleDaily(
        `medication-${med.id}`,
        discreet ? DISCREET_TITLE : 'Medication Reminder',
        discreet ? DISCREET_MED : `Time to take your ${med.name}.`,
        medHour,
        medMinute
      );
    }
  }
}

/**
 * Parse a time string (HH:mm) with NaN guards.
 */
function parseTime(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(':').map(Number);
  return { hour: isNaN(h) ? 9 : h, minute: isNaN(m) ? 0 : m };
}

/**
 * Schedule a date notification, catching errors so one failure
 * doesn't prevent the rest from being scheduled.
 */
async function safeScheduleDate(id: string, title: string, body: string, date: Date): Promise<void> {
  try {
    await scheduleDateNotification(id, title, body, date);
  } catch (err) {
    console.warn(`Failed to schedule notification ${id}:`, err);
  }
}

/**
 * Schedule a daily notification, catching errors so one failure
 * doesn't prevent the rest from being scheduled.
 */
async function safeScheduleDaily(id: string, title: string, body: string, hour: number, minute: number): Promise<void> {
  try {
    await scheduleDailyNotification(id, title, body, hour, minute);
  } catch (err) {
    console.warn(`Failed to schedule notification ${id}:`, err);
  }
}

/**
 * Set hour and minute on a Date, returning a new Date.
 */
function setTimeOnDate(date: Date, hour: number, minute: number): Date {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function scheduleDateNotification(
  id: string,
  title: string,
  body: string,
  date: Date
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
  });
}

async function scheduleDailyNotification(
  id: string,
  title: string,
  body: string,
  hour: number,
  minute: number
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}
