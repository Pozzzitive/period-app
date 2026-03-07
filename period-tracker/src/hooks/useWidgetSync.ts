import React from 'react';
import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { computeWidgetData, type WidgetData } from '../services/widget-data';

function syncToNativeWidgets(data: WidgetData): void {
  try {
    if (Platform.OS === 'ios') {
      const { CycleWidget } = require('../widgets/CycleWidget');
      CycleWidget.updateSnapshot({
        cycleDay: data.cycleDay ?? 14,
        phaseName: data.currentPhase ?? 'Ovulation',
        phaseColor: data.phaseColor ?? '#A888C4',
        daysUntilNextPeriod: data.daysUntilNextPeriod ?? 14,
        cycleLength: data.cycleLength ?? 28,
        periodLength: data.periodLength ?? 5,
        isPremiumPlus: data.isPremiumPlus,
      });
    } else if (Platform.OS === 'android') {
      const { requestWidgetUpdate } = require('react-native-android-widget');
      const { CycleWidget: AndroidCycleWidget } = require('../widgets/android/CycleWidget');
      const renderFn = (widgetInfo: { width: number; height: number }) =>
        React.createElement(AndroidCycleWidget, {
          data,
          width: widgetInfo.width,
          height: widgetInfo.height,
        });
      requestWidgetUpdate({
        widgetName: 'CycleWidget',
        renderWidget: renderFn,
      }).catch(() => {});
      requestWidgetUpdate({
        widgetName: 'CycleWidgetWide',
        renderWidget: renderFn,
      }).catch(() => {});
    }
  } catch {
    // Widget modules may not be available in all environments
  }
}

export function useWidgetSync(): void {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Always sync — widget shows teaser for free users, real data for premium
    const data = computeWidgetData();
    syncToNativeWidgets(data);

    // Sync when returning to foreground
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        const freshData = computeWidgetData();
        syncToNativeWidgets(freshData);
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, []);
}
