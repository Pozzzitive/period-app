import { useState, useCallback, useRef } from 'react';
import { useFocusEffect, useNavigation } from 'expo-router';

/**
 * Returns a key that increments every time the screen gains focus
 * via a tab switch or initial mount. Skips the increment when
 * returning from a pushed stack screen (settings, day detail, etc.)
 * to avoid replaying entrance animations over already-visible content.
 */
export function useFocusKey() {
  const [key, setKey] = useState(0);
  const navigation = useNavigation();
  const wasStackPushRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!wasStackPushRef.current) {
        setKey((k) => k + 1);
      }
      wasStackPushRef.current = false;

      return () => {
        // On blur, check if a stack screen was pushed on top.
        // Parent of the Tabs navigator is the root Stack — if it has
        // more than 1 route, a screen was pushed over the tabs.
        const parent = navigation.getParent();
        if (parent) {
          const state = parent.getState();
          if (state && state.routes.length > 1) {
            wasStackPushRef.current = true;
          }
        }
      };
    }, [navigation]),
  );

  return key;
}
