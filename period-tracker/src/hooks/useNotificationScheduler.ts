import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useCycleStore, useUserStore, useSettingsStore } from '../stores';
import { predictNextPeriod } from '../engine';
import { scheduleNotifications } from '../notifications/scheduler';

export function useNotificationScheduler() {
  const cycles = useCycleStore((s) => s.cycles);
  const profile = useUserStore((s) => s.profile);
  const notifications = useSettingsStore((s) => s.settings.notifications);

  const scheduleRef = useRef<(() => void) | undefined>(undefined);

  // Keep ref updated with latest closure
  scheduleRef.current = () => {
    const prediction = predictNextPeriod(
      cycles,
      profile.typicalCycleLength,
      profile.typicalPeriodLength
    );
    scheduleNotifications(prediction, notifications, profile.isTeenager);
  };

  // Schedule when dependencies change
  useEffect(() => {
    scheduleRef.current?.();
  }, [cycles, notifications, profile.typicalCycleLength, profile.typicalPeriodLength, profile.isTeenager]);

  // Reschedule when app returns to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        scheduleRef.current?.();
      }
    });
    return () => sub.remove();
  }, []);
}
