import React from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface AnimatedViewSwitcherProps {
  transitionKey: string;
  children: React.ReactNode;
  className?: string;
}

export function AnimatedViewSwitcher({
  transitionKey,
  children,
  className = 'flex-1',
}: AnimatedViewSwitcherProps) {
  return (
    <Animated.View
      key={transitionKey}
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(150)}
      className={className}
    >
      {children}
    </Animated.View>
  );
}
