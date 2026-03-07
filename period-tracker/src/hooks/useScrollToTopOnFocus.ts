import { useRef, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';

/**
 * Returns a ScrollView ref that automatically scrolls to top
 * whenever the screen gains focus (e.g. switching tabs).
 */
export function useScrollToTopOnFocus() {
  const ref = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      ref.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  return ref;
}
