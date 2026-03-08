import React, { useRef, useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useTheme } from '../../theme';

interface AppSheetProps {
  visible: boolean;
  onClose: () => void;
  snapPoints?: (string | number)[];
  enableKeyboard?: boolean;
  scrollable?: boolean;
  children: React.ReactNode;
}

export function AppSheet({
  visible,
  onClose,
  snapPoints,
  enableKeyboard,
  scrollable,
  children,
}: AppSheetProps) {
  const { colors } = useTheme();
  const ref = useRef<BottomSheetModal>(null);
  const isPresented = useRef(false);

  useEffect(() => {
    if (visible && !isPresented.current) {
      ref.current?.present();
      isPresented.current = true;
    } else if (!visible && isPresented.current) {
      ref.current?.dismiss();
      isPresented.current = false;
    }
  }, [visible]);

  const handleDismiss = useCallback(() => {
    isPresented.current = false;
    onClose();
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  const Content = scrollable ? BottomSheetScrollView : BottomSheetView;

  return (
    <BottomSheetModal
      ref={ref}
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      enableDynamicSizing={!snapPoints}
      snapPoints={snapPoints}
      enablePanDownToClose
      handleIndicatorStyle={[styles.handle, { backgroundColor: colors.handleColor }]}
      backgroundStyle={{ backgroundColor: colors.sheetBackground }}
      {...(enableKeyboard && {
        keyboardBehavior: 'interactive' as const,
        keyboardBlurBehavior: 'restore' as const,
        android_keyboardInputMode: 'adjustResize' as const,
      })}
      animationConfigs={{
        damping: 15,
        stiffness: 150,
        mass: 0.5,
        overshootClamping: false,
      }}
    >
      <Content style={scrollable ? styles.scrollContent : undefined}>
        {children}
      </Content>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
