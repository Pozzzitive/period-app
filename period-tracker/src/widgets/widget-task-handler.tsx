import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { CycleWidget } from './android/CycleWidget';
import { getStoredWidgetData, type WidgetData } from '../services/widget-data';

function getFallbackData(): WidgetData {
  return {
    daysUntilNextPeriod: null,
    currentPhase: null,
    phaseColor: null,
    cycleDay: null,
    cycleLength: null,
    periodLength: null,
    nextPeriodDate: null,
    isPremiumPlus: false,
    lastUpdated: new Date().toISOString(),
  };
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetInfo, widgetAction, renderWidget } = props;

  const widgetName = widgetInfo.widgetName;

  switch (widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      if (widgetName === 'CycleWidget' || widgetName === 'CycleWidgetWide') {
        const data = getStoredWidgetData() ?? getFallbackData();
        renderWidget(
          <CycleWidget
            data={data}
            width={widgetInfo.width}
            height={widgetInfo.height}
          />,
        );
      }
      break;
    }
    case 'WIDGET_CLICK':
      // Widget click opens the app via OPEN_APP clickAction
      break;
    case 'WIDGET_DELETED':
      break;
  }
}
