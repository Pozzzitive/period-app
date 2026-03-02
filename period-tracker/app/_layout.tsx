import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo } from 'react';
import { StatusBar } from 'react-native';
import 'react-native-reanimated';

import { AppThemeProvider, useTheme } from '@/src/theme';
import { useUserStore } from '@/src/stores';
import { useNotificationScheduler } from '@/src/hooks';

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
  const router = useRouter();
  const segments = useSegments();

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

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Stack>
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="day/[date]" options={{ title: 'Day Details', presentation: 'card', headerBackTitle: 'Back' }} />
        <Stack.Screen name="settings/notifications" options={{ title: 'Notifications', headerBackTitle: 'Back' }} />
        <Stack.Screen name="settings/app-lock" options={{ title: 'App Lock', headerBackTitle: 'Back' }} />
        <Stack.Screen name="settings/health-conditions" options={{ title: 'Health Conditions', headerBackTitle: 'Back' }} />
        <Stack.Screen name="settings/privacy" options={{ title: 'Privacy Policy', headerBackTitle: 'Back' }} />
        <Stack.Screen name="settings/data-management" options={{ title: 'Data Management', headerBackTitle: 'Back' }} />
        <Stack.Screen name="settings/teenager-mode" options={{ title: 'Teenager Mode', headerBackTitle: 'Back' }} />
<Stack.Screen name="subscription/paywall" options={{ title: 'Premium Plus', presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
