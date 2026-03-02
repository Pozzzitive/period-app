import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, type ThemeColors } from '@/src/theme';
import { s, fs } from '@/src/utils/scale';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="flower-outline" size={s(64)} color={colors.primary} style={styles.heroIcon} />
        <Text style={styles.title}>Period Tracker</Text>
        <Text style={styles.subtitle}>Your cycle, your data, your control.</Text>

        <View style={styles.features}>
          <FeatureItem iconName="shield-checkmark-outline" text="100% private — your data stays on your device" />
          <FeatureItem iconName="trending-up-outline" text="Smart predictions that learn your patterns" />
          <FeatureItem iconName="notifications-outline" text="Gentle reminders when you need them" />
          <FeatureItem iconName="close-circle-outline" text="No ads. No data selling. Ever." />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/(onboarding)/cycle-info')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function FeatureItem({ iconName, text }: { iconName: React.ComponentProps<typeof Ionicons>['name']; text: string }) {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(12) }}>
      <Ionicons name={iconName} size={s(24)} color={colors.primary} />
      <Text style={{ fontSize: fs(15), color: colors.text, flex: 1 }}>{text}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: s(24),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroIcon: {
    marginBottom: s(16),
  },
  title: {
    fontSize: fs(32),
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: s(8),
  },
  subtitle: {
    fontSize: fs(16),
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: s(40),
  },
  features: {
    alignSelf: 'stretch',
    gap: s(16),
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: s(16),
    borderRadius: s(12),
    alignItems: 'center',
    marginBottom: s(16),
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: fs(18),
    fontWeight: '600',
  },
});
