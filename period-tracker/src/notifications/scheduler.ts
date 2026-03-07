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

  if (prediction) {
    const nextStart = parseISO(prediction.nextPeriodStart);
    const nextEnd = parseISO(prediction.nextPeriodEnd);

    // Period reminder (5 days before)
    if (settings.periodReminder) {
      const reminderDate = addDays(nextStart, -5);
      if (reminderDate > now) {
        await scheduleDateNotification(
          NOTIF_IDS.PERIOD_REMINDER,
          'Period Reminder',
          'Your period is estimated to start in 5 days. How are you feeling?',
          setTimeOnDate(reminderDate, cycleHour, cycleMinute)
        );
      }
    }

    // Period starting (day of)
    if (settings.periodStarting) {
      if (nextStart > now) {
        await scheduleDateNotification(
          NOTIF_IDS.PERIOD_STARTING,
          'Period Starting',
          "Your period may start today. Don't forget to log it when it begins.",
          setTimeOnDate(nextStart, cycleHour, cycleMinute)
        );
      }
    }

    // Premenstrual phase (6 days before, avoids overlap with period reminder at -5)
    if (settings.premenstrualPhase) {
      const pmsDate = addDays(nextStart, -6);
      if (pmsDate > now) {
        await scheduleDateNotification(
          NOTIF_IDS.PREMENSTRUAL,
          'Premenstrual Phase',
          "You're entering the premenstrual phase. PMS symptoms like mood changes and bloating are common right now.",
          setTimeOnDate(pmsDate, cycleHour, cycleMinute)
        );
      }
    }

    // Cycle summary (day after period ends)
    if (settings.cycleSummary) {
      const summaryDate = addDays(nextEnd, 1);
      if (summaryDate > now) {
        await scheduleDateNotification(
          NOTIF_IDS.CYCLE_SUMMARY,
          'Cycle Summary',
          'Your period has ended. Check your cycle summary and insights.',
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
          const body = intent === 'conceive'
            ? 'Your fertile window begins today — this is a great time to try!'
            : 'Your fertile window begins today — be extra careful if you want to avoid pregnancy.';
          await scheduleDateNotification(
            NOTIF_IDS.FERTILE_WINDOW,
            'Fertile Window',
            body,
            setTimeOnDate(fertileDate, cycleHour, cycleMinute)
          );
        }
      }

      // Peak fertility
      if (settings.peakFertility && prediction.ovulationDate) {
        const ovulationDate = parseISO(prediction.ovulationDate);
        if (ovulationDate > now) {
          const body = intent === 'conceive'
            ? 'Today is your estimated ovulation day — your best chance to conceive!'
            : 'Today is your estimated ovulation day — highest risk of pregnancy. Use protection if needed.';
          await scheduleDateNotification(
            NOTIF_IDS.PEAK_FERTILITY,
            'Peak Fertility',
            body,
            setTimeOnDate(ovulationDate, cycleHour, cycleMinute)
          );
        }
      }

      // Low fertility (2 days after ovulation)
      if (settings.lowFertility && prediction.ovulationDate) {
        const lowFertDate = addDays(parseISO(prediction.ovulationDate), 2);
        if (lowFertDate > now) {
          const body = intent === 'conceive'
            ? 'You have likely passed your fertile window for this cycle.'
            : 'Your fertile window has likely passed — lower chance of pregnancy for the rest of this cycle.';
          await scheduleDateNotification(
            NOTIF_IDS.LOW_FERTILITY,
            'Low Fertility',
            body,
            setTimeOnDate(lowFertDate, cycleHour, cycleMinute)
          );
        }
      }
    }
  }

  // Daily log reminder
  if (settings.dailyLogReminder) {
    const [hours, minutes] = (settings.dailyLogReminderTime ?? '21:00').split(':').map(Number);
    await scheduleDailyNotification(
      NOTIF_IDS.DAILY_LOG,
      'Daily Log Reminder',
      'How was your day? Take a moment to log your symptoms and mood.',
      hours,
      minutes
    );
  }

  // Contraception reminder (daily at user-chosen time)
  if (settings.contraceptionReminder) {
    const [hours, minutes] = (settings.contraceptionReminderTime ?? '09:00').split(':').map(Number);
    await scheduleDailyNotification(
      NOTIF_IDS.CONTRACEPTION,
      'Contraception Reminder',
      'Time for your contraception — patch, ring, or injection check.',
      hours,
      minutes
    );
  }

  // Medication reminders (one daily notification per enabled medication)
  for (const med of (settings.medications ?? [])) {
    if (med.enabled) {
      const [hours, minutes] = med.time.split(':').map(Number);
      await scheduleDailyNotification(
        `medication-${med.id}`,
        'Medication Reminder',
        `Time to take your ${med.name}.`,
        hours,
        minutes
      );
    }
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
