import * as Notifications from 'expo-notifications';
import { addDays, parseISO, setHours, setMinutes } from 'date-fns';
import type { PredictionResult } from '../models';
import type { NotificationSettings } from '../models';

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
  PILL_REMINDER: 'pill-reminder',
};

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

  if (!prediction) return;

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const nextStart = parseISO(prediction.nextPeriodStart);
  const now = new Date();

  // Period reminder (5 days before)
  if (settings.periodReminder) {
    const reminderDate = addDays(nextStart, -5);
    if (reminderDate > now) {
      await scheduleNotification(
        NOTIF_IDS.PERIOD_REMINDER,
        'Period Reminder',
        'Your period is estimated to start in 5 days. How are you feeling?',
        reminderDate
      );
    }
  }

  // Period starting (day of)
  if (settings.periodStarting) {
    if (nextStart > now) {
      await scheduleNotification(
        NOTIF_IDS.PERIOD_STARTING,
        'Period Starting',
        "Your period may start today. Don't forget to log it when it begins.",
        nextStart
      );
    }
  }

  // Premenstrual phase
  if (settings.premenstrualPhase) {
    const pmsDate = addDays(nextStart, -5);
    if (pmsDate > now) {
      await scheduleNotification(
        NOTIF_IDS.PREMENSTRUAL,
        'Premenstrual Phase',
        "You're entering the premenstrual phase. PMS symptoms like mood changes and bloating are common right now.",
        pmsDate
      );
    }
  }

  // Fertile window (skip for teenagers)
  if (!isTeenager && settings.fertileWindowOpen && prediction.fertileWindowStart) {
    const fertileDate = parseISO(prediction.fertileWindowStart);
    if (fertileDate > now) {
      await scheduleNotification(
        NOTIF_IDS.FERTILE_WINDOW,
        'Fertile Window',
        "Your fertile window begins today. You're approaching your most fertile days.",
        fertileDate
      );
    }
  }

  // Peak fertility (skip for teenagers)
  if (!isTeenager && settings.peakFertility && prediction.ovulationDate) {
    const ovulationDate = parseISO(prediction.ovulationDate);
    if (ovulationDate > now) {
      await scheduleNotification(
        NOTIF_IDS.PEAK_FERTILITY,
        'Peak Fertility',
        "Today is your estimated ovulation day — your most fertile day of the cycle.",
        ovulationDate
      );
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

  // Pill reminder
  if (settings.pillReminder) {
    const [hours, minutes] = (settings.pillReminderTime ?? '09:00').split(':').map(Number);
    await scheduleDailyNotification(
      NOTIF_IDS.PILL_REMINDER,
      'Pill Reminder',
      'Time to take your pill.',
      hours,
      minutes
    );
  }
}

async function scheduleNotification(
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
