import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { useUserStore } from '@/src/stores';

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

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const onboardingCompleted = useUserStore((s) => s.profile.onboardingCompleted);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inOnboarding = segments[0] === '(onboarding)';

    if (!onboardingCompleted && !inOnboarding) {
      router.replace('/(onboarding)/welcome');
    } else if (onboardingCompleted && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [onboardingCompleted, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="day/[date]" options={{ title: 'Day Details', presentation: 'card' }} />
        <Stack.Screen name="settings/notifications" options={{ title: 'Notifications' }} />
        <Stack.Screen name="settings/app-lock" options={{ title: 'App Lock' }} />
        <Stack.Screen name="settings/health-conditions" options={{ title: 'Health Conditions' }} />
        <Stack.Screen name="settings/privacy" options={{ title: 'Privacy Policy' }} />
        <Stack.Screen name="settings/data-management" options={{ title: 'Data Management' }} />
        <Stack.Screen name="settings/teenager-mode" options={{ title: 'Teenager Mode' }} />
        <Stack.Screen name="subscription/paywall" options={{ title: 'Premium Plus', presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
