import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="cycle-info" />
      <Stack.Screen name="age-setup" />
      <Stack.Screen name="health-conditions" />
      <Stack.Screen name="notifications-setup" />
      <Stack.Screen name="consent" />
    </Stack>
  );
}
