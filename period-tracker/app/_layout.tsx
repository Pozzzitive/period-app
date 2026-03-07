import "../global.css";

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo, useRef } from 'react';
import { StatusBar, AppState } from 'react-native';
import 'react-native-reanimated';

import { AppThemeProvider, useTheme, themeToVars } from '@/src/theme';
import { useUserStore, useSettingsStore, useAuthStore } from '@/src/stores';
import { useNotificationScheduler } from '@/src/hooks';
import { useWidgetSync } from '@/src/hooks/useWidgetSync';
import { LockScreen } from '@/src/components/common/LockScreen';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppThemeProvider>
      <RootLayoutNav />
    </AppThemeProvider>
  );
}

function RootLayoutNav() {
  const { colors, isDark } = useTheme();
  const onboardingCompleted = useUserStore((s) => s.profile.onboardingCompleted);
  useNotificationScheduler();
  useWidgetSync();
  const router = useRouter();
  const segments = useSegments();

  // App lock state
  const appLockEnabled = useSettingsStore((s) => s.settings.appLock.enabled);
  const timeoutMinutes = useSettingsStore((s) => s.settings.appLock.timeoutMinutes);
  const isLocked = useAuthStore((s) => s.isLocked);
  const lastActiveAt = useAuthStore((s) => s.lastActiveAt);
  const lock = useAuthStore((s) => s.lock);
  const setLastActive = useAuthStore((s) => s.setLastActive);
  const appState = useRef(AppState.currentState);

  // Use refs to avoid re-attaching the listener on every state change (#18)
  const lastActiveRef = useRef(lastActiveAt);
  const timeoutRef = useRef(timeoutMinutes);
  const lockRef = useRef(lock);
  const setLastActiveRef = useRef(setLastActive);
  const appLockRef = useRef(appLockEnabled);

  useEffect(() => { lastActiveRef.current = lastActiveAt; }, [lastActiveAt]);
  useEffect(() => { timeoutRef.current = timeoutMinutes; }, [timeoutMinutes]);
  useEffect(() => { lockRef.current = lock; }, [lock]);
  useEffect(() => { setLastActiveRef.current = setLastActive; }, [setLastActive]);
  useEffect(() => { appLockRef.current = appLockEnabled; }, [appLockEnabled]);

  // Lock on app background → foreground if timeout exceeded
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (!appLockRef.current) {
        appState.current = nextState;
        return;
      }
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        // App came to foreground — check if lock timeout exceeded
        const last = lastActiveRef.current;
        if (last) {
          const elapsed = Date.now() - new Date(last).getTime();
          const timeoutMs = timeoutRef.current * 60 * 1000;
          if (elapsed > timeoutMs) {
            lockRef.current();
          }
        } else {
          // No last active time recorded — lock
          lockRef.current();
        }
      } else if (nextState.match(/inactive|background/)) {
        // App going to background — record timestamp
        setLastActiveRef.current();
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, []);

  // Lock on first mount if app lock is enabled (#17 — use current store values)
  useEffect(() => {
    // Read fresh values from stores directly to avoid stale closure
    const enabled = useSettingsStore.getState().settings.appLock.enabled;
    const locked = useAuthStore.getState().isLocked;
    const lastActive = useAuthStore.getState().lastActiveAt;
    const timeout = useSettingsStore.getState().settings.appLock.timeoutMinutes;

    if (enabled && !locked) {
      if (lastActive) {
        const elapsed = Date.now() - new Date(lastActive).getTime();
        const timeoutMs = timeout * 60 * 1000;
        if (elapsed > timeoutMs) {
          useAuthStore.getState().lock();
        }
      } else {
        useAuthStore.getState().lock();
      }
    }
  }, []);

  const navigationTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
      },
    };
  }, [isDark, colors]);

  useEffect(() => {
    const inOnboarding = segments[0] === '(onboarding)';

    if (!onboardingCompleted && !inOnboarding) {
      router.replace('/(onboarding)/welcome');
    } else if (onboardingCompleted && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [onboardingCompleted, segments]);

  // Show lock screen overlay
  if (appLockEnabled && isLocked) {
    return (
      <ThemeProvider value={navigationTheme}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
        <LockScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Stack screenOptions={{ animation: 'ios_from_right', contentStyle: themeToVars(colors) as any }}>
        <Stack.Screen name="(onboarding)" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="day/[date]" options={{ title: 'Day Details', presentation: 'card', animation: 'fade_from_bottom', headerBackTitle: 'Back' }} />
        <Stack.Screen name="settings/notifications" options={{ title: 'Notifications', headerBackTitle: 'Back' }} />
        <Stack.Screen name="settings/app-lock" options={{ title: 'App Lock', headerBackTitle: 'Back' }} />
        <Stack.Screen name="settings/health-conditions" options={{ title: 'Health Conditions', headerBackTitle: 'Back' }} />
        <Stack.Screen name="settings/privacy" options={{ title: 'Privacy Policy', animation: 'fade', headerBackTitle: 'Back' }} />
        <Stack.Screen name="settings/data-management" options={{ title: 'Data Management', headerBackTitle: 'Back' }} />
        <Stack.Screen name="settings/teenager-mode" options={{ title: 'Teenager Mode', headerBackTitle: 'Back' }} />
        <Stack.Screen name="settings/custom-symptoms" options={{ title: 'Custom Symptoms', headerBackTitle: 'Back' }} />
        <Stack.Screen name="settings/age" options={{ title: 'Age', headerBackTitle: 'Back' }} />
        <Stack.Screen name="subscription/paywall" options={{ title: 'Premium Plus', presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </ThemeProvider>
  );
}
