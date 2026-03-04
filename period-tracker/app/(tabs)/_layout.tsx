import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { s, fs } from '@/src/utils/scale';

export default function TabLayout() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const headerButtons = () => (
    <View style={layoutStyles.headerRight}>
      <TouchableOpacity
        onPress={() => router.push('/settings/notifications')}
        style={layoutStyles.headerButton}
        activeOpacity={0.6}
      >
        <Ionicons name="notifications-outline" size={s(22)} color={colors.textSecondary} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/settings')}
        style={layoutStyles.headerButton}
        activeOpacity={0.6}
      >
        <Ionicons name="settings-outline" size={s(22)} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  // Semi-transparent tinted backgrounds for translucent bars
  const headerBg = colors.primaryLight + (isDark ? 'CC' : 'BB');
  const tabBarBg = colors.primaryLight + (isDark ? 'CC' : 'BB');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          position: 'absolute',
          paddingTop: s(6),
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
          fontWeight: '600',
          marginTop: -2,
        },
        headerTransparent: true,
        headerBackground: () => (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: headerBg }]} />
        ),
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerTintColor: colors.text,
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
          title: 'Log',
          tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" color={color} size={size ? s(size) : s(24)} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="flower-outline" color={color} size={size ? s(size) : s(24)} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" color={color} size={size ? s(size) : s(24)} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const layoutStyles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: s(12),
    gap: s(4),
  },
  headerButton: {
    padding: s(4),
  },
});
