import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, themeToVars } from '@/src/theme';
import { fs } from '@/src/utils/scale';
import { AdBanner } from '@/src/components/ads/AdBanner';
import { useSubscriptionStore, selectShouldShowAds } from '@/src/stores/subscription-store';
import { useUserStore } from '@/src/stores';

const TAB_BAR_HEIGHT = 49;

export default function TabLayout() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const showAds = useSubscriptionStore(selectShouldShowAds);
  const isTeenager = useUserStore((s) => s.profile.isTeenager);

  const headerButtons = () => (
    <View className="flex-row items-center mr-3 gap-1">
      <TouchableOpacity
        onPress={() => router.push('/settings/notifications')}
        className="p-1"
        activeOpacity={0.6}
      >
        <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/settings')}
        className="p-1"
        activeOpacity={0.6}
      >
        <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  // Semi-transparent tinted backgrounds for translucent bars
  const headerBg = colors.primaryLight + (isDark ? 'CC' : 'BB');
  const tabBarBg = colors.primaryLight + (isDark ? 'CC' : 'BB');

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.tabBarActive,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarStyle: {
            position: 'absolute',
            paddingTop: 6,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.tabBarBorder,
            backgroundColor: 'transparent',
            elevation: 0,
          },
          tabBarBackground: () => (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: tabBarBg }]} />
          ),
          tabBarLabelStyle: {
            fontSize: fs(11),
            fontWeight: '700',
            marginTop: -2,
          },
          sceneStyle: { ...(themeToVars(colors) as any), ...(showAds ? { paddingBottom: 50 } : {}) },
          headerTransparent: true,
          headerBackground: () => (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: headerBg }]} />
          ),
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTintColor: colors.text,
          headerTitleAlign: 'center',
          headerRight: headerButtons,
          headerShadowVisible: false,
        }}
      >
        <Tabs.Screen
          name="calendar"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="log"
          options={{
            title: 'Intimacy',
            ...(isTeenager ? { href: null } : {}),
            tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" color={color} size={size ?? 24} />,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Ionicons name="flower-outline" color={color} size={size ?? 24} />,
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            title: 'Insights',
            tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" color={color} size={size ?? 24} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            href: null,
          }}
        />
      </Tabs>
      {showAds && (
        <View
          style={{
            position: 'absolute',
            bottom: TAB_BAR_HEIGHT + insets.bottom,
            left: 0,
            right: 0,
            zIndex: 999,
            elevation: 10,
            backgroundColor: tabBarBg,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.tabBarBorder,
            paddingVertical: 4,
          }}
          pointerEvents="box-none"
        >
          <AdBanner containerStyle={{ marginVertical: 0 }} />
        </View>
      )}
    </View>
  );
}
