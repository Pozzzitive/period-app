import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 24 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <Ionicons name="flower-outline" size={64} color={colors.primary} style={{ marginBottom: 16, alignSelf: 'center' }} />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.primary, marginBottom: 8, textAlign: 'center' }}>Period Tracker</Text>
          <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 40 }}>Your cycle, your data, your control.</Text>
        </Animated.View>

        <View style={{ alignSelf: 'stretch', gap: 16 }}>
          <Animated.View entering={FadeInDown.duration(500).delay(300)}>
            <FeatureItem iconName="shield-checkmark-outline" text="100% private — your data stays on your device" />
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(500).delay(400)}>
            <FeatureItem iconName="trending-up-outline" text="Smart predictions that learn your patterns" />
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(500).delay(500)}>
            <FeatureItem iconName="notifications-outline" text="Gentle reminders when you need them" />
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(500).delay(600)}>
            <FeatureItem iconName="close-circle-outline" text="No ads. No data selling. Ever." />
          </Animated.View>
        </View>
      </View>

      <Animated.View entering={FadeInDown.duration(500).delay(700)}>
        <TouchableOpacity
          style={{ backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 }}
          onPress={() => router.push('/(onboarding)/cycle-info')}
        >
          <Text style={{ color: colors.onPrimary, fontSize: 18, fontWeight: '600' }}>Get Started</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

function FeatureItem({ iconName, text }: { iconName: React.ComponentProps<typeof Ionicons>['name']; text: string }) {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Ionicons name={iconName} size={24} color={colors.primary} />
      <Text style={{ fontSize: 15, color: colors.text, flex: 1 }}>{text}</Text>
    </View>
  );
}
