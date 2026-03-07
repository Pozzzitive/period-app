# Expo Animations & Advanced UI Reference

All examples use **react-native-reanimated 3+** and **react-native-gesture-handler 2+** with **NativeWind**.

```bash
npx expo install react-native-reanimated react-native-gesture-handler
```

---

## Pill / Segment Sliding Menu

Animated pill that slides between tab options — smooth spring animation.

```tsx
import { useRef, useState } from 'react';
import { View, Text, Pressable, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring
} from 'react-native-reanimated';

interface Tab { id: string; label: string }

export function PillMenu({ tabs, onChange }: { tabs: Tab[]; onChange?: (id: string) => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [tabWidths, setTabWidths] = useState<number[]>([]);
  const translateX = useSharedValue(0);
  const pillWidth = useSharedValue(0);

  const handleTabLayout = (index: number, width: number) => {
    setTabWidths(prev => {
      const next = [...prev];
      next[index] = width;
      return next;
    });
  };

  const selectTab = (index: number) => {
    const offset = tabWidths.slice(0, index).reduce((a, b) => a + b, 0);
    translateX.value = withSpring(offset, { damping: 20, stiffness: 200 });
    pillWidth.value = withSpring(tabWidths[index] ?? 80, { damping: 20, stiffness: 200 });
    setActiveIndex(index);
    onChange?.(tabs[index].id);
  };

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: pillWidth.value,
  }));

  return (
    <View className="flex-row bg-gray-100 rounded-full p-1 relative">
      {/* Sliding pill background */}
      <Animated.View
        style={pillStyle}
        className="absolute top-1 bottom-1 bg-white rounded-full shadow-sm"
      />
      {tabs.map((tab, i) => (
        <Pressable
          key={tab.id}
          onPress={() => selectTab(i)}
          onLayout={(e: LayoutChangeEvent) => handleTabLayout(i, e.nativeEvent.layout.width)}
          className="px-4 py-2 z-10"
        >
          <Text className={`text-sm font-medium ${activeIndex === i ? 'text-gray-900' : 'text-gray-400'}`}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// Usage:
// <PillMenu tabs={[{ id: 'all', label: 'All' }, { id: 'active', label: 'Active' }]} onChange={setFilter} />
```

---

## Screen Slide-In from Side (Custom Drawer / Panel)

Right-side panel that slides in over content, with backdrop fade.

```tsx
import { useEffect } from 'react';
import { View, Text, Pressable, Dimensions, BackHandler } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PANEL_WIDTH = SCREEN_WIDTH * 0.82;

interface SidePanelProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: 'left' | 'right';
}

export function SidePanel({ visible, onClose, children, side = 'right' }: SidePanelProps) {
  const translateX = useSharedValue(side === 'right' ? PANEL_WIDTH : -PANEL_WIDTH);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateX.value = withSpring(0, { damping: 24, stiffness: 200 });
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      const target = side === 'right' ? PANEL_WIDTH : -PANEL_WIDTH;
      translateX.value = withSpring(target, { damping: 24, stiffness: 200 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  // Android back button
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible]);

  // Swipe to dismiss
  const swipeGesture = Gesture.Pan()
    .onEnd((e) => {
      const shouldClose = side === 'right'
        ? e.translationX > PANEL_WIDTH * 0.3
        : e.translationX < -PANEL_WIDTH * 0.3;
      if (shouldClose) runOnJS(onClose)();
      else translateX.value = withSpring(0);
    });

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!visible && translateX.value === (side === 'right' ? PANEL_WIDTH : -PANEL_WIDTH)) return null;

  return (
    <View className="absolute inset-0 z-50">
      {/* Backdrop */}
      <Animated.View style={backdropStyle} className="absolute inset-0 bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
      </Animated.View>

      {/* Panel */}
      <GestureDetector gesture={swipeGesture}>
        <Animated.View
          style={[panelStyle, { width: PANEL_WIDTH }]}
          className={`absolute top-0 bottom-0 bg-white shadow-2xl ${side === 'right' ? 'right-0' : 'left-0'}`}
        >
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
```

---

## Smooth Sliding / Swipeable List Items (Swipe to Delete/Action)

```tsx
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, runOnJS
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const ACTION_WIDTH = 80;

export function SwipeableRow({
  children,
  onDelete,
}: {
  children: React.ReactNode;
  onDelete: () => void;
}) {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      translateX.value = Math.max(-ACTION_WIDTH * 1.5, Math.min(0, e.translationX));
    })
    .onEnd((e) => {
      if (e.translationX < -ACTION_WIDTH * 0.6) {
        translateX.value = withSpring(-ACTION_WIDTH);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View className="relative overflow-hidden">
      {/* Action behind */}
      <View className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 justify-center items-center">
        <Pressable onPress={onDelete} className="flex-1 justify-center items-center w-full">
          <Text className="text-white font-semibold text-sm">Delete</Text>
        </Pressable>
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={rowStyle} className="bg-white">
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
```

---

## Smooth Slideable Calendar (Week Strip)

Horizontally swipeable week view with smooth snap between weeks.

```tsx
import { useState, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DAY_WIDTH = SCREEN_WIDTH / 7;

function getWeekDays(baseDate: Date): Date[] {
  const start = new Date(baseDate);
  start.setDate(start.getDate() - start.getDay()); // Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function WeekCalendar({
  onDateSelect,
}: {
  onDateSelect?: (date: Date) => void;
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const indicatorX = useSharedValue(selectedDate.getDay() * DAY_WIDTH);

  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const days = getWeekDays(baseDate);

  const selectDay = (date: Date) => {
    setSelectedDate(date);
    indicatorX.value = withSpring(date.getDay() * DAY_WIDTH, { damping: 18, stiffness: 180 });
    onDateSelect?.(date);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) =>
    date.toDateString() === selectedDate.toDateString();

  return (
    <View className="bg-white pb-2">
      {/* Month + nav */}
      <View className="flex-row justify-between items-center px-4 py-2">
        <Text className="text-base font-semibold text-gray-900">
          {baseDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>
        <View className="flex-row gap-4">
          <Pressable onPress={() => setWeekOffset(w => w - 1)} className="p-1">
            <Text className="text-indigo-500 font-medium">‹ Prev</Text>
          </Pressable>
          <Pressable onPress={() => setWeekOffset(w => w + 1)} className="p-1">
            <Text className="text-indigo-500 font-medium">Next ›</Text>
          </Pressable>
        </View>
      </View>

      {/* Day labels */}
      <View className="flex-row px-2">
        {DAYS.map((d, i) => (
          <Text key={i} style={{ width: DAY_WIDTH }} className="text-center text-xs text-gray-400 font-medium pb-1">
            {d}
          </Text>
        ))}
      </View>

      {/* Date buttons + sliding indicator */}
      <View className="relative">
        {/* Sliding circle indicator */}
        <Animated.View
          style={[indicatorStyle, { width: DAY_WIDTH }]}
          className="absolute top-0 bottom-0 justify-center items-center pointer-events-none"
        >
          <View className="w-9 h-9 rounded-full bg-indigo-500" />
        </Animated.View>

        <View className="flex-row px-2">
          {days.map((date, i) => (
            <Pressable
              key={i}
              style={{ width: DAY_WIDTH }}
              className="h-10 justify-center items-center z-10"
              onPress={() => selectDay(date)}
            >
              <Text
                className={`text-sm font-semibold ${
                  isSelected(date)
                    ? 'text-white'
                    : isToday(date)
                    ? 'text-indigo-500'
                    : 'text-gray-800'
                }`}
              >
                {date.getDate()}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
```

---

## Fade + Slide Screen Transitions (Expo Router)

```tsx
// app/_layout.tsx — custom transition for stack screens
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',       // iOS-style
        // Other options: 'fade', 'slide_from_bottom', 'flip', 'none'
        animationDuration: 280,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen name="modal" options={{ animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
```

---

## Skeleton Loading Shimmer

```tsx
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, interpolate
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { View } from 'react-native';

export function Skeleton({ className }: { className?: string }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.4, 1]),
  }));

  return <Animated.View style={style} className={`bg-gray-200 rounded-lg ${className}`} />;
}

// Usage:
// <Skeleton className="h-4 w-3/4 mb-2" />
// <Skeleton className="h-4 w-1/2" />
```

---

## Bottom Sheet

```bash
npx expo install @gorhom/bottom-sheet
```

```tsx
import { useRef, useCallback } from 'react';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { View, Text, Button } from 'react-native';

export function MyScreen() {
  const sheetRef = useRef<BottomSheet>(null);

  return (
    <View className="flex-1">
      <Button title="Open Sheet" onPress={() => sheetRef.current?.expand()} />

      <BottomSheet
        ref={sheetRef}
        index={-1}             // -1 = closed initially
        snapPoints={['40%', '85%']}
        enablePanDownToClose
        backgroundStyle={{ borderRadius: 24 }}
      >
        <BottomSheetView className="px-4 pt-2">
          <Text className="text-lg font-semibold">Sheet Content</Text>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
```

---

## Shared Element / Hero Transitions

For hero animations between screens, use `react-native-reanimated`'s `SharedTransition`:

```tsx
import Animated from 'react-native-reanimated';

// Screen A — list item
<Animated.Image
  sharedTransitionTag={`photo-${item.id}`}
  source={{ uri: item.photo }}
  className="w-full h-48 rounded-xl"
/>

// Screen B — detail
<Animated.Image
  sharedTransitionTag={`photo-${item.id}`}
  source={{ uri: item.photo }}
  className="w-full h-72"
/>
```
