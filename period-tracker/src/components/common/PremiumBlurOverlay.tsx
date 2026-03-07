import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme';

interface PremiumBlurOverlayProps {
  children: React.ReactNode;
}

export function PremiumBlurOverlay({ children }: PremiumBlurOverlayProps) {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  return (
    <View>
      {/* Render the actual content behind the blur */}
      <View pointerEvents="none">
        {children}
      </View>

      {/* Blurred overlay */}
      <View style={StyleSheet.absoluteFill} className="rounded-[14px] overflow-hidden">
        <BlurView
          intensity={25}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        {/* Semi-transparent tint for extra obscuring */}
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)' },
          ]}
        />

        {/* Unlock prompt */}
        <View className="absolute inset-0 justify-center items-center px-6">
          <View
            className="rounded-2xl p-5 items-center w-full"
            style={{ backgroundColor: colors.surface + 'F2', maxWidth: 280, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }}
          >
            <Text className="text-2xl mb-2">✨</Text>
            <Text className="text-base font-semibold text-center mb-1" style={{ color: colors.text }}>Premium Plus</Text>
            <Text className="text-sm text-center mb-4" style={{ color: colors.textTertiary }}>
              Unlock charts, analytics, and more
            </Text>
            <TouchableOpacity
              className="py-2.5 px-8 rounded-xl"
              style={{ backgroundColor: colors.primary }}
              onPress={() => router.push('/subscription/paywall')}
            >
              <Text className="text-sm font-semibold" style={{ color: colors.onPrimary }}>See Plans</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
