import React, { useCallback, useMemo, useRef } from 'react';
import { PanResponder, Pressable, View, type GestureResponderHandlers } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '@/src/theme';

export interface PillOption<T extends string = string> {
  value: T;
  label: string;
}

interface AnimatedPillToggleProps<T extends string = string> {
  options: PillOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

const SPRING_CONFIG = { damping: 20, stiffness: 250, mass: 0.8 };
const SWIPE_THRESHOLD = 50;

/**
 * Hook that returns PanResponder handlers for swiping between pill toggle options.
 * Spread the returned `panHandlers` onto the View wrapping the screen content.
 */
export function usePillSwipe<T extends string>(
  options: readonly PillOption<T>[] | PillOption<T>[],
  selected: T,
  onSelect: (value: T) => void,
): GestureResponderHandlers {
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gs) =>
          Math.abs(gs.dx) > Math.abs(gs.dy) * 2 && Math.abs(gs.dx) > 30,
        onPanResponderRelease: (_, gs) => {
          const opts = optionsRef.current;
          const idx = opts.findIndex((o) => o.value === selectedRef.current);
          if (gs.dx < -SWIPE_THRESHOLD && idx < opts.length - 1) {
            Haptics.selectionAsync();
            onSelectRef.current(opts[idx + 1].value);
          } else if (gs.dx > SWIPE_THRESHOLD && idx > 0) {
            Haptics.selectionAsync();
            onSelectRef.current(opts[idx - 1].value);
          }
        },
      }),
    [],
  );

  return panResponder.panHandlers;
}

export function AnimatedPillToggle<T extends string = string>({
  options,
  selected,
  onSelect,
}: AnimatedPillToggleProps<T>) {
  const { colors } = useTheme();
  const containerWidth = useSharedValue(0);
  const selectedIndex = options.findIndex((o) => o.value === selected);

  const onLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number } } }) => {
      containerWidth.value = e.nativeEvent.layout.width;
    },
    [containerWidth],
  );

  const indicatorStyle = useAnimatedStyle(() => {
    const optionWidth = containerWidth.value / options.length;
    return {
      width: optionWidth,
      transform: [{ translateX: withSpring(selectedIndex * optionWidth, SPRING_CONFIG) }],
    };
  }, [selectedIndex, options.length]);

  const indicatorShadow = {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  };

  return (
    <View
      className="flex-row rounded-[22px] p-[3px]"
      style={{ backgroundColor: colors.surfaceTertiary }}
      onLayout={onLayout}
    >
      {/* Sliding indicator */}
      <Animated.View
        style={[
          indicatorStyle,
          indicatorShadow,
          { position: 'absolute', top: 3, bottom: 3, left: 3, borderRadius: 20 },
        ]}
      />

      {/* Options */}
      {options.map((option, index) => (
        <PillOptionButton
          key={option.value}
          label={option.label}
          isSelected={index === selectedIndex}
          onPress={() => onSelect(option.value)}
          activeColor={colors.onPrimary}
          inactiveColor={colors.textMuted}
        />
      ))}
    </View>
  );
}

function PillOptionButton({
  label,
  isSelected,
  onPress,
  activeColor,
  inactiveColor,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  activeColor: string;
  inactiveColor: string;
}) {
  const progress = useSharedValue(isSelected ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(isSelected ? 1 : 0, { duration: 200 });
  }, [isSelected, progress]);

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [inactiveColor, activeColor]),
  }));

  return (
    <Pressable
      className="flex-1 py-[9px] items-center rounded-[20px]"
      onPress={() => { Haptics.selectionAsync(); onPress(); }}
    >
      <Animated.Text
        style={[textStyle, { fontSize: 14, fontWeight: isSelected ? '700' : '600' }]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
}
