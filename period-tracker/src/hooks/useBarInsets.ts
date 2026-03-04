import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NAV_BAR_HEIGHT = 44;
const TAB_BAR_HEIGHT = 49;

/** Returns the padding needed to avoid translucent header and tab bar. */
export function useBarInsets() {
  const insets = useSafeAreaInsets();
  return {
    top: insets.top + NAV_BAR_HEIGHT,
    bottom: TAB_BAR_HEIGHT + insets.bottom,
  };
}
